export class AccountModel {
  public id: string;
  public account: string;
  public balance: number;

  constructor(params: { id: string; account: string; balance: number }) {
    this.id = params.id;
    this.account = params.account;
    this.balance = params.balance;
  }
}
