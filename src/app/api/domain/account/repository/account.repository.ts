import { AccountModel } from "../model/account.model";
import { CreateAccountInput } from "../ports/inbound/create-account.port";
import { UpdateAccountInput } from "../ports/inbound/update-account.port";

export interface AccountRepository {
  getAll(): Promise<AccountModel[]>;

  getAccountById(id: string): Promise<AccountModel | null>;

  getAccountByRef(ref: string): Promise<AccountModel | null>;

  create(data: CreateAccountInput): Promise<string>;

  update(data: UpdateAccountInput): Promise<void>;

  delete(id: string): Promise<void>;

  updateOrCreateAccount(ref: string, balance: number): Promise<void>;
}
