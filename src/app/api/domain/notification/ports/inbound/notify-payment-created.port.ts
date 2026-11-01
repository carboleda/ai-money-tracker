import { TransactionType } from "@/app/api/domain/transaction/model/transaction.model";

export interface NotifyPaymentCreatedInput {
  transactionId: string;
  description: string;
  amount: number;
  type: TransactionType;
}
