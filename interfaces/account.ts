export interface AccountEntity {
  account: string;
  balance: number;
}

export interface Account extends AccountEntity {
  id: string;
}
