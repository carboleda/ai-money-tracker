import { Timestamp } from "firebase-admin/firestore";

export enum TransactionType {
  INCOME = "income",
  EXPENSE = "expense",
  TRANSFER = "transfer",
}

export enum TransactionStatus {
  PENDING = "pending",
  COMPLETE = "complete",
}

export interface TransactionEntity {
  description: string;
  type: TransactionType;
  status: TransactionStatus;
  category?: string;
  sourceAccount: string;
  destinationAccount?: string;
  amount: number;
  createdAt: Timestamp;
}

export interface PendingTransactionEntity
  extends Omit<TransactionEntity, "sourceAccount" | "destinationAccount"> {}

export interface Transaction extends Omit<TransactionEntity, "createdAt"> {
  id: string;
  createdAt: string;
}

export interface GetTransactionsResponse {
  accounts: { [key: string]: string };
  transactions: Transaction[];
}
