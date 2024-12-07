import { Collections, db } from "@/firebase/server";
import {
  TransactionEntity,
  TransactionStatus,
  TransactionType,
} from "@/interfaces/transaction";
import { OnEvent } from "@/app/api/event-bus/decorators";
import { EventTypes, SingleParamEvent, UpdateEvent } from "../event-bus";
import { QueryDocumentSnapshot } from "firebase-admin/firestore";
import { Account, AccountEntity } from "@/interfaces/account";
import { getAccountName } from "@/config/utils";

export class AccountShareFunctions {
  @OnEvent(EventTypes.TRANSACTION_CREATED)
  static async onTransactionCreated(
    transaction: SingleParamEvent<TransactionEntity>
  ) {
    console.log("onTransactionCreated(RECEIVED)", transaction);
    const accountEntities = AccountShareFunctions.handleEvent(
      transaction,
      false
    );
    console.log("onTransactionCreated(UPDATING ACCOUNTS)", { accountEntities });
    for await (const account of accountEntities) {
      await AccountShareFunctions.updateOrCreateAccount(
        account.account,
        account.balance
      );
    }
  }

  @OnEvent(EventTypes.TRANSACTION_DELETED)
  static async onTransactionDeleted(
    transaction: SingleParamEvent<TransactionEntity>
  ) {
    console.log("onTransactionDeleted(RECEIVED)", transaction);
    const accountEntities = AccountShareFunctions.handleEvent(
      transaction,
      true
    );

    console.log("onTransactionDeleted(UPDATING ACCOUNTS)", { accountEntities });
    for (const account of accountEntities) {
      await AccountShareFunctions.updateOrCreateAccount(
        account.account,
        account.balance
      );
    }
  }

  @OnEvent(EventTypes.TRANSACTION_UPDATED)
  static async onTransactionUpdated({
    oldData: oldTransaction,
    newData: newTransaction,
  }: UpdateEvent<TransactionEntity>) {
    console.log("onTransactionUpdated(RECEIVED)", {
      oldTransaction,
      newTransaction,
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

  private static handleEvent(
    transaction: TransactionEntity,
    isRollback: boolean
  ) {
    if (
      transaction.status === TransactionStatus.PENDING ||
      (!transaction.sourceAccount && !transaction.destinationAccount)
    ) {
      return [];
    }

    const accountEntities: AccountEntity[] = [];
    if (transaction.type === TransactionType.TRANSFER) {
      accountEntities.push({
        account: transaction.sourceAccount,
        balance: transaction.amount * (isRollback ? 1 : -1),
      });

      accountEntities.push({
        account: transaction.destinationAccount!,
        balance: transaction.amount * (isRollback ? -1 : 1),
      });
    } else {
      accountEntities.push({
        account: transaction.sourceAccount,
        balance:
          transaction.amount *
          (transaction.type === TransactionType.EXPENSE ? -1 : 1) *
          (isRollback ? -1 : 1),
      });
    }

    return accountEntities;
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
}
