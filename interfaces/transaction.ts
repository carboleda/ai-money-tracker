import { Timestamp } from "firebase-admin/firestore";

export enum TransactionType {
  INCOME = "income",
  EXPENSE = "expense",
  TRANSFER = "transfer",
}

export enum TransactionCategory {
  Alimentos = "Alimentos",
  Educacion = "Educación",
  Inversion = "Inversión",
  Salud = "Salud",
  Servicios = "Servicios",
  Transporte = "Transporte",
  Vivienda = "Vivienda",
  Zeus = "Zeus",
}

export enum TransactionStatus {
  PENDING = "pending",
  COMPLETE = "complete",
}

export interface Summary {
  totalIncomes: number;
  totalExpenses: number;
  totalPending: number;
  totalBalance: number;
}

export interface TransactionEntity {
  id: string;
  description: string;
  paymentLink?: string;
  notes?: string;
  type: TransactionType;
  status: TransactionStatus;
  category?: TransactionCategory;
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
  summary: Summary;
}

export const transactionCategoryOptions = Object.entries(
  TransactionCategory
).reduce((acc, [key, value]) => {
  return [...acc, { value: key, label: value }];
}, [] as Record<string, string>[]);