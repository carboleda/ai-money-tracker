import { Collections, db } from "@/firebase/server";
import { QueryDocumentSnapshot } from "firebase-admin/firestore";
import { Account, AccountEntity } from "@/interfaces/account";
import { getAccountName } from "@/config/utils";

export class AccountShareFunctions {
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

  static async updateOrCreateAccount(account: string, balance: number) {
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
