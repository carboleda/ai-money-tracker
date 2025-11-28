import { AccountModel } from "../model/account.model";

export interface AccountRepository {
  getAll(): Promise<AccountModel[]>;

  getAccountById(id: string): Promise<AccountModel>;

  updateOrCreateAccount(account: string, balance: number): Promise<void>;
}
