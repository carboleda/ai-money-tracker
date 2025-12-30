export enum AccountType {
  SAVING = "saving",
  CREDIT = "credit",
  INVESTMENT = "investment",
}

export type CreateAccountInput = Omit<AccountModel, "id" | "isDeleted">;

export type UpdateAccountInput = Partial<
  Omit<AccountModel, "id" | "ref" | "balance" | "isDeleted">
> & { id: string };

export class AccountModel {
  public id: string;
  public ref: string;
  public name: string;
  public balance: number;
  public icon: string;
  public type: AccountType;
  public description?: string;
  public isDeleted: boolean;

  constructor(params: {
    id: string;
    ref: string;
    name: string;
    balance: number;
    icon: string;
    type: AccountType;
    description?: string;
    isDeleted: boolean;
  }) {
    this.id = params.id;
    this.ref = params.ref;
    this.name = params.name;
    this.balance = params.balance;
    this.icon = params.icon;
    this.type = params.type;
    this.description = params.description;
    this.isDeleted = params.isDeleted;
  }
}
