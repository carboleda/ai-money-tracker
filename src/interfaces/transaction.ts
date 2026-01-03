import { TransactionCategory } from "@/app/api/domain/transaction/model/transaction.model";
import { TransactionOutput } from "@/app/api/domain/transaction/ports/outbound/filter-transactions.port";
import { TransactionEntity } from "@/app/api/drivers/firestore/transaction/transaction.entity";

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

export interface PendingTransactionEntity
  extends Omit<TransactionEntity, "sourceAccount" | "destinationAccount"> {}

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
  transactions: TransactionOutput[];
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
