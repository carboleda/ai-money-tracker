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

@Injectable()
export class AccountFirestoreRepository implements AccountRepository {
  constructor(
    @Inject(Firestore) private readonly firestore: Firestore,
    @InjectUserId() private readonly userId: string
  ) {}

  async getAll(): Promise<AccountModel[]> {
    const snapshot = await this.firestore
      .collection(Collections.Accounts)
      .get();

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
    console.log(
      "Firestore instance:",
      this.firestore.collection(Collections.Accounts)
    );
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
    const accounts = await this.firestore
      .collection(Collections.Accounts)
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
    await this.firestore.collection(Collections.Accounts).add({
      account,
      balance,
    });
  }
}
