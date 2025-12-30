import {
  TransactionCategory,
  TransactionStatus,
  TransactionType,
} from "@/app/api/domain/transaction/model/transaction.model";

export interface CreateTransactionInput {
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
