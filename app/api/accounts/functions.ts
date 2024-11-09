import { Collections, db } from "@/firebase/server";
import { TransactionEntity, TransactionType } from "@/interfaces/transaction";
import { OnEvent } from "../event-bus/decorators";
import { EventTypes } from "../event-bus";
import { QueryDocumentSnapshot } from "firebase-admin/firestore";

export class AccountShareFunctions {
  @OnEvent(EventTypes.TRANSACTION_CREATED)
  static async onTransactionCreated(transaction: TransactionEntity) {
    console.log("onTransactionCreated", { transaction });
    const accountDocument = await AccountShareFunctions.getAccountDocument(
      transaction.sourceAccount
    );

    const transactionAmount =
      transaction.amount *
      (transaction.type === TransactionType.EXPENSE ? -1 : 1);

    if (accountDocument) {
      await AccountShareFunctions.updateAccountBalance(
        accountDocument,
        transactionAmount
      );
      return;
    }

    await AccountShareFunctions.createInitialAccount(
      transaction.sourceAccount,
      transactionAmount
    );
  }

  @OnEvent(EventTypes.TRANSACTION_DELETED)
  static async onTransactionDeleted(transaction: TransactionEntity) {
    console.log("onTransactionDeleted", { transaction });
    const accountDocument = await AccountShareFunctions.getAccountDocument(
      transaction.sourceAccount
    );

    const transactionAmount =
      transaction.amount *
      (transaction.type === TransactionType.EXPENSE ? 1 : -1);

    if (accountDocument) {
      await AccountShareFunctions.updateAccountBalance(
        accountDocument,
        transactionAmount
      );
      return;
    }

    await AccountShareFunctions.createInitialAccount(
      transaction.sourceAccount,
      transactionAmount
    );
  }

  static async getAccountDocument(
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

  static async updateAccountBalance(
    accountDocument: QueryDocumentSnapshot,
    transactionAmount: number
  ) {
    const accountEntity = accountDocument.data();
    accountEntity.balance += transactionAmount;

    accountDocument.ref.update(accountEntity);
  }

  static async createInitialAccount(account: string, balance: number) {
    await db.collection(Collections.Accounts).add({
      account,
      balance,
    });
  }
}
