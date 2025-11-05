import {
  TransactionCategory,
  TransactionStatus,
  TransactionType,
} from "@/app/api/domain/transaction/model/transaction.model";
import { Timestamp } from "firebase-admin/firestore";

export interface TransactionEntity extends FirebaseFirestore.DocumentData {
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
