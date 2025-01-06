import { Timestamp } from "firebase-admin/firestore";

export enum TransactionType {
  INCOME = "income",
  EXPENSE = "expense",
  TRANSFER = "transfer",
}

export enum TransactionCategory {
  Salario = "Salario",
  PagoTC = "Pago TC",
  Alimentos = "Alimentos",
  Mercado = "Mercado",
  Educacion = "Educación",
  Inversion = "Inversión",
  Salud = "Salud",
  Servicios = "Servicios",
  Transporte = "Transporte",
  Vivienda = "Vivienda",
  Bebe = "Bebé",
  Zeus = "Zeus",
  Ocio = "Ocio",
  Impuesto = "Impuesto",
  Retiros = "Retiros",
  Vestuario = "Vestuario",
  Otros = "Otros",
}

export enum TransactionStatus {
  PENDING = "pending",
  COMPLETE = "complete",
}

export enum TransactionOverdueStatus {
  OVERDUE = "overdue",
  SOON = "soon",
  UPCOMING = "upcoming",
}

export interface Summary {
  totalIncomes: number;
  totalExpenses: number;
  totalPending: number;
  totalTransfers: number;
  totalBalance: number;
}

export interface TransactionEntity {
  id: string;
  description: string;
  paymentLink?: string;
  notes?: string;
  type: TransactionType;
  status: TransactionStatus;
  category?: TransactionCategory | string;
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
  isReccurent?: boolean;
}

export interface CreateFreeTextTranaction {
  text: string;
  createdAt?: string;
  picture?: never;
  sourceAccount?: never;
}

export interface CreatePictureTranaction {
  text?: never;
  createdAt?: never;
  picture: string;
  sourceAccount: string;
}

export type CreateTranaction =
  | CreateFreeTextTranaction
  | CreatePictureTranaction;

export interface GetTransactionsResponse {
  accounts: { [key: string]: string };
  transactions: Transaction[];
  summary: Summary;
}

export namespace GeneratedTransaction {
  export interface InvalidTranactionError {
    error: string;
  }

  export interface TransactionData {
    description: string;
    amount: number;
    type: string;
    sourceAccount: string;
    category?: string;
    createdAt?: string;
    destinationAccount?: string;
    error: never;
  }

  export type GeneratedResponse =
    | TransactionData
    | InvalidTranactionError
    | null;
}

export const transactionCategoryOptions = Object.entries(TransactionCategory).reduce(
  (acc, [_key, value]) => {
    return [...acc, { value: value, label: value }];
  },
  [] as Record<string, string>[]
);