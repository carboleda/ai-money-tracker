import { TransactionOutput } from "@/app/api/domain/transaction/ports/outbound/filter-transactions.port";
import { TransactionEntity } from "@/app/api/drivers/firestore/transaction/transaction.entity";
import {
  TransactionType,
  TransactionStatus,
} from "@/app/api/domain/transaction/model/transaction.model";

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

/**
 * Body accepted by `POST /api/transaction/parse` (stateless GenAI extraction,
 * does not touch the database). See sdd/ai-draft-transaction-pipeline.md §3.2.2.
 */
export interface ParseTransactionDraftRequest {
  text?: string;
  picture?: string; // Base64 encoded receipt image
}

/**
 * Successful response from `POST /api/transaction/parse`.
 * See sdd/ai-draft-transaction-pipeline.md §3.2.2.
 */
export interface ParseTransactionDraftResponse {
  amount: number;
  type: TransactionType;
  categoryRef: string;
  sourceAccountRef: string;
  destinationAccountRef?: string;
  description: string;
  createdAt: string; // ISO 8601 string
  confidence: number; // 0.00 to 1.00
}

/**
 * Structured error body returned by `POST /api/transaction/parse` on
 * 400/422 responses. See sdd/ai-draft-transaction-pipeline.md §3.2.2.
 */
export interface ParseTransactionDraftErrorResponse {
  message: string;
  code: "MISSING_INPUT_FIELDS" | "UNPARSEABLE_DRAFT" | string;
  missingFields?: string[];
}

/**
 * Body accepted by `POST /api/transaction` (direct persistence).
 * See sdd/ai-draft-transaction-pipeline.md §3.2.3.
 */
export interface CreateTransactionPayload {
  description: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  sourceAccount: string;
  destinationAccount?: string;
  category?: string;
  paymentLink?: string;
  createdAt: string; // ISO 8601 string
  isRecurrent?: boolean;
}

export interface GetTransactionsResponse {
  transactions: TransactionOutput[];
  summary: Summary;
}
