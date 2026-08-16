import {
  AccountSummary,
  CategorySummary,
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
  category?: CategorySummary;
  sourceAccount: AccountSummary;
  destinationAccount?: AccountSummary;
  amount: number;
  createdAt: string;
  isRecurrent?: boolean;
}
