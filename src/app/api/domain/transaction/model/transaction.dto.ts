import {
  TransactionCategory,
  TransactionStatus,
  TransactionType,
} from "./transaction.model";

export interface TransactionDto {
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
  createdAt: Date;
  isRecurrent?: boolean;
}
