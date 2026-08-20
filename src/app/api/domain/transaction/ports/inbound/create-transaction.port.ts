import {
  TransactionStatus,
  TransactionType,
} from "@/app/api/domain/transaction/model/transaction.model";

export interface CreateTransactionInput {
  description: string;
  paymentLink?: string;
  notes?: string;
  type: TransactionType;
  status: TransactionStatus;
  category?: string;
  sourceAccount: string;
  destinationAccount?: string;
  amount: number;
  createdAt: Date;
  isRecurrent?: boolean;
}

/**
 * Request body accepted by `POST /api/transaction`. `createdAt` is a
 * client-supplied ISO 8601 string (or omitted, in which case the route
 * defaults it to the current time) rather than a `Date` instance, since it
 * arrives over the wire as JSON.
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
  createdAt?: string;
  isRecurrent?: boolean;
}
