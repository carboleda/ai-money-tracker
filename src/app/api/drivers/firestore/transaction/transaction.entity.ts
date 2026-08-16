import {
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
  category?: string;
  sourceAccount: string;
  destinationAccount?: string;
  isRecurrent?: boolean;
  amount: number;
  createdAt: Timestamp;
}
