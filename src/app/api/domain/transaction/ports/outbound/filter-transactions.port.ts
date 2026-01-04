import {
  AccountSummary,
  TransactionCategory,
  TransactionStatus,
  TransactionType,
} from "@/app/api/domain/transaction/model/transaction.model";

export interface TransactionOutput {
  id: string;
  description: string;
  paymentLink?: string;
  notes?: string;
  type: TransactionType;
  status: TransactionStatus;
  category?: TransactionCategory | string;
  sourceAccount: AccountSummary;
  destinationAccount?: AccountSummary;
  amount: number;
  createdAt: string;
  isRecurrent?: boolean;
}
