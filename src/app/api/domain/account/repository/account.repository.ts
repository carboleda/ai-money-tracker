import {
  AccountModel,
  CreateAccountInput,
  UpdateAccountInput,
} from "../model/account.model";

export interface AccountRepository {
  getAll(): Promise<AccountModel[]>;

  getAccountById(id: string): Promise<AccountModel | null>;

  getAccountByRef(ref: string): Promise<AccountModel | null>;

  create(data: CreateAccountInput): Promise<AccountModel>;

  update(id: string, data: UpdateAccountInput): Promise<AccountModel>;

  delete(id: string): Promise<void>;

  updateOrCreateAccount(account: string, balance: number): Promise<void>;
}
