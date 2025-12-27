import {
  Injectable,
  Inject,
  InjectUserContext,
} from "@/app/api/decorators/tsyringe.decorator";
import {
  AccountModel,
  CreateAccountInput,
  UpdateAccountInput,
} from "@/app/api/domain/account/model/account.model";
import { AccountRepository } from "@/app/api/domain/account/repository/account.repository";
import { AccountAdapter } from "./account.adapter";
import { Firestore, QueryDocumentSnapshot } from "firebase-admin/firestore";
import { Collections } from "../types";
import { AccountEntity } from "./account.entity";
import { BaseFirestoreRepository } from "@/app/api/drivers/firestore/base/base.firestore.repository";
import type { UserContext } from "@/app/api/context/user-context";

@Injectable()
export class AccountFirestoreRepository
  extends BaseFirestoreRepository
  implements AccountRepository
{
  constructor(
    @Inject(Firestore) firestore: Firestore,
    @InjectUserContext() userContext: UserContext
  ) {
    super(Collections.Accounts, firestore, userContext);
  }

  async getAll(): Promise<AccountModel[]> {
    const snapshot = await this.getUserCollectionReference()
      .where("isDeleted", "==", false)
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

  async getAccountById(id: string): Promise<AccountModel | null> {
    const doc = await this.getUserCollectionReference().doc(id).get();

    if (!doc.exists) {
      return null;
    }

    const entity = { ...doc.data() } as AccountEntity;
    return AccountAdapter.toModel(entity, doc.id);
  }

  async getAccountByRef(ref: string): Promise<AccountModel | null> {
    const snapshot = await this.getUserCollectionReference()
      .where("ref", "==", ref)
      .where("isDeleted", "==", false)
      .limit(1)
      .get();

    if (snapshot.size === 0) {
      return null;
    }

    const doc = snapshot.docs[0];
    const entity = { ...doc.data() } as AccountEntity;
    return AccountAdapter.toModel(entity, doc.id);
  }

  async create(data: CreateAccountInput): Promise<string> {
    // Check if ref already exists for this user
    const existingAccount = await this.getAccountByRef(data.ref);
    if (existingAccount) {
      throw new Error(`Account reference '${data.ref}' already exists`);
    }

    const entity: AccountEntity = {
      ref: data.ref,
      name: data.name,
      icon: data.icon,
      type: data.type,
      description: data.description,
      balance: data.balance,
      isDeleted: false,
    };

    const docRef = await this.getUserCollectionReference().add(entity);
    const doc = await docRef.get();

    return doc.id;
  }

  async update(data: UpdateAccountInput): Promise<void> {
    const account = await this.getAccountById(data.id);
    if (!account) {
      throw new Error(`Account with id '${data.id}' not found`);
    }

    const updates: Partial<AccountEntity> = {};
    if (data.name !== undefined) updates.name = data.name;
    if (data.icon !== undefined) updates.icon = data.icon;
    if (data.type !== undefined) updates.type = data.type;
    if (data.description !== undefined) updates.description = data.description;

    await this.getUserCollectionReference().doc(data.id).update(updates);
  }

  async delete(id: string): Promise<void> {
    const account = await this.getAccountById(id);
    if (!account) {
      throw new Error(`Account with id '${id}' not found`);
    }

    await this.getUserCollectionReference().doc(id).update({ isDeleted: true });
  }

  private async getAccountDocument(
    account: string
  ): Promise<QueryDocumentSnapshot | null> {
    // Try to find by ref (new field) or account (legacy field)
    let query = this.getUserCollectionReference().where("ref", "==", account);

    let snapshot = await query.get();

    if (snapshot.size > 0) {
      return snapshot.docs[0];
    }

    // Fallback to legacy account field for backward compatibility
    query = this.getUserCollectionReference().where("account", "==", account);
    snapshot = await query.get();

    if (snapshot.size > 0) {
      return snapshot.docs[0];
    }

    return null;
  }

  private async updateAccountBalance(
    accountDocument: QueryDocumentSnapshot,
    transactionAmount: number
  ) {
    const accountEntity = accountDocument.data() as AccountEntity;
    accountEntity.balance += transactionAmount;

    accountDocument.ref.update(accountEntity);
  }

  private async createInitialAccount(account: string, balance: number) {
    const entity: AccountEntity = {
      ref: account,
      name: account,
      icon: "💳",
      type: "saving",
      balance,
      isDeleted: false,
    };

    await this.getUserCollectionReference().add(entity);
  }
}
