import {
  Injectable,
  Inject,
  InjectUserId,
} from "@/app/api/decorators/tsyringe.decorator";
import { AccountModel } from "@/app/api/domain/account/model/account.model";
import { AccountRepository } from "@/app/api/domain/account/repository/account.repository";
import { AccountAdapter } from "./account.adapter";
import { Firestore, QueryDocumentSnapshot } from "firebase-admin/firestore";
import { Collections } from "../types";
import { AccountEntity } from "./account.entity";
import { BaseFirestoreRepository } from "@/app/api/drivers/firestore/base/base.firestore.repository";

@Injectable()
export class AccountFirestoreRepository
  extends BaseFirestoreRepository
  implements AccountRepository
{
  constructor(
    @Inject(Firestore) firestore: Firestore,
    @InjectUserId() userId: string
  ) {
    super(Collections.Accounts, firestore, userId);
  }

  async getAll(): Promise<AccountModel[]> {
    const snapshot = await this.getUserCollectionReference().get();

    const accounts = snapshot.docs.map((doc) => {
      const entity = { ...doc.data() } as AccountEntity;
      return AccountAdapter.toModel(entity, doc.id);
    });

    return accounts;
  }

  async updateOrCreateAccount(account: string, balance: number) {
    const accountDocument = await this.getAccountDocument(account);

    if (accountDocument) {
      return this.updateAccountBalance(accountDocument, balance);
    }

    await this.createInitialAccount(account, balance);
  }

  getAccountById(id: string): Promise<AccountModel> {
    // TODO: Query the Firestore database to get the account with the given ID
    console.log("Firestore instance:", this.getUserCollectionReference());
    return Promise.resolve(
      AccountAdapter.toModel(
        {
          account: "Account " + id,
          balance: 1000,
        },
        "id"
      )
    );
  }

  private async getAccountDocument(
    account: string
  ): Promise<QueryDocumentSnapshot | null> {
    const accounts = await this.getUserCollectionReference()
      .where("account", "==", account)
      .get();

    if (accounts.size > 0) {
      return accounts.docs.at(0) || null;
    }

    return null;
  }

  private async updateAccountBalance(
    accountDocument: QueryDocumentSnapshot,
    transactionAmount: number
  ) {
    const accountEntity = accountDocument.data();
    accountEntity.balance += transactionAmount;

    accountDocument.ref.update(accountEntity);
  }

  private async createInitialAccount(account: string, balance: number) {
    await this.getUserCollectionReference().add({
      account,
      balance,
    });
  }
}
