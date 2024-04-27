export enum TransactionType {
  INCOME = "income",
  EXPENSE = "expense",
  TRANSFER = "transfer",
}

export interface Transaction {
  id: string;
  description: string;
  type: TransactionType;
  category: string;
  sourceAccount: string;
  destinationAccount?: string;
  amount: number;
}

export interface GetTransactionsResponse {
  accounts: { [key: string]: string };
  transactions: Transaction[];
}