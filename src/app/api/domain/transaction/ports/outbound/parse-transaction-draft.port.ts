import { TransactionType } from "@/app/api/domain/transaction/model/transaction.model";

export interface ParseTransactionDraftResponse {
  amount: number;
  type: TransactionType;
  categoryRef: string;
  sourceAccountRef: string;
  destinationAccountRef?: string;
  description: string;
  createdAt: string; // ISO 8601 string (includes date and time)
  confidence: number; // 0.00 to 1.00 score
}
