export enum TransactionType {
  INCOME = "income",
  EXPENSE = "expense",
  TRANSFER = "transfer",
}

export enum TransactionStatus {
  PENDING = "pending",
  COMPLETE = "complete",
}

export interface Transaction {
  id: string;
  description: string;
  type: TransactionType;
  category: string;
  sourceAccount: string;
  destinationAccount?: string;
  amount: number;
  createdAt: string;
}

export interface RecurringExpenseTransaction
  extends Omit<Transaction, "id" | "sourceAccount" | "destinationAccount"> {
  status: TransactionStatus;
}

export interface GetTransactionsResponse {
  accounts: { [key: string]: string };
  transactions: Transaction[];
}