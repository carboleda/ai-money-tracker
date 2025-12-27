import {
  AccountModel,
  CreateAccountInput,
  UpdateAccountInput,
} from "../model/account.model";

export interface AccountRepository {
  getAll(): Promise<AccountModel[]>;

  getAccountById(id: string): Promise<AccountModel | null>;

  getAccountByRef(ref: string): Promise<AccountModel | null>;

  create(data: CreateAccountInput): Promise<string>;

  update(data: UpdateAccountInput): Promise<void>;

  delete(id: string): Promise<void>;

  updateOrCreateAccount(account: string, balance: number): Promise<void>;
}
