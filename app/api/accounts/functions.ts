import { Collections, db } from "@/firebase/server";
import {
  TransactionEntity,
  TransactionStatus,
  TransactionType,
} from "@/interfaces/transaction";
import { OnEvent } from "../event-bus/decorators";
import { EventTypes } from "../event-bus";
import { QueryDocumentSnapshot } from "firebase-admin/firestore";
import { Account, AccountEntity } from "@/interfaces/account";
import { getAccountName } from "@/config/utils";

export class AccountShareFunctions {
  @OnEvent(EventTypes.TRANSACTION_CREATED)
  static async onTransactionCreated(transaction: TransactionEntity) {
    console.log(
      "AccountShareFunctions.onTransactionCreated(RECEIVED)",
      transaction
    );
    if (
      transaction.status === TransactionStatus.PENDING ||
      !(transaction.sourceAccount && transaction.destinationAccount)
    ) {
      return;
    }

    console.log(
      "AccountShareFunctions.onTransactionCreated(VALIDATING)",
      transaction
    );
    const accountEntities: AccountEntity[] = [];
    if (transaction.type === TransactionType.TRANSFER) {
      accountEntities.push({
        account: transaction.sourceAccount,
        balance: transaction.amount * -1,
      });

      accountEntities.push({
        account: transaction.destinationAccount!,
        balance: transaction.amount,
      });
    } else {
      accountEntities.push({
        account: transaction.sourceAccount,
        balance:
          transaction.amount *
          (transaction.type === TransactionType.EXPENSE ? -1 : 1),
      });
    }

    console.log(
      "AccountShareFunctions.onTransactionCreated(UPDATING ACCOUNTS)",
      { accountEntities }
    );
    for await (const account of accountEntities) {
      await AccountShareFunctions.updateOrCreateAccount(
        account.account,
        account.balance
      );
    }
  }

  @OnEvent(EventTypes.TRANSACTION_DELETED)
  static async onTransactionDeleted(transaction: TransactionEntity) {
    console.log(
      "AccountShareFunctions.onTransactionDeleted(RECEIVED)",
      transaction
    );
    const accountEntities: AccountEntity[] = [];
    if (
      transaction.status === TransactionStatus.PENDING ||
      !(transaction.sourceAccount && transaction.destinationAccount)
    ) {
      return;
    }

    console.log(
      "AccountShareFunctions.onTransactionDeleted(VALIDATING)",
      transaction
    );
    if (transaction.type === TransactionType.TRANSFER) {
      accountEntities.push({
        account: transaction.sourceAccount,
        balance: transaction.amount,
      });

      accountEntities.push({
        account: transaction.destinationAccount!,
        balance: transaction.amount * -1,
      });
    } else {
      accountEntities.push({
        account: transaction.sourceAccount,
        balance:
          transaction.amount *
          (transaction.type === TransactionType.EXPENSE ? 1 : -1),
      });
    }

    console.log(
      "AccountShareFunctions.onTransactionDeleted(UPDATING ACCOUNTS)",
      { accountEntities }
    );
    for (const account of accountEntities) {
      await AccountShareFunctions.updateOrCreateAccount(
        account.account,
        account.balance
      );
    }
  }

  private static async getAccountDocument(
    account: string
  ): Promise<QueryDocumentSnapshot | null> {
    const accounts = await db
      .collection(Collections.Accounts)
      .where("account", "==", account)
      .get();

    if (accounts.size > 0) {
      return accounts.docs.at(0) || null;
    }

    return null;
  }

  private static async updateOrCreateAccount(account: string, balance: number) {
    const accountDocument = await AccountShareFunctions.getAccountDocument(
      account
    );

    if (accountDocument) {
      return AccountShareFunctions.updateAccountBalance(
        accountDocument,
        balance
      );
    }

    await AccountShareFunctions.createInitialAccount(account, balance);
  }

  private static async updateAccountBalance(
    accountDocument: QueryDocumentSnapshot,
    transactionAmount: number
  ) {
    const accountEntity = accountDocument.data();
    accountEntity.balance += transactionAmount;

    accountDocument.ref.update(accountEntity);
  }

  private static async createInitialAccount(account: string, balance: number) {
    await db.collection(Collections.Accounts).add({
      account,
      balance,
    });
  }

  static async getAllAccounts(): Promise<Account[]> {
    const snapshot = await db.collection(Collections.Accounts).get();

    const accounts = snapshot.docs.map((doc) => {
      const docData = { ...doc.data() } as AccountEntity;
      return {
        ...docData,
        id: doc.id,
        account: getAccountName(docData.account),
      } as Account;
    });

    return accounts;
  }
}
