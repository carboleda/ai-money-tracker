import {
  TransactionType,
  TransactionStatus,
  TransactionCategory,
} from "@/app/api/domain/transaction/model/transaction.model";
import { TransactionEntity } from "../../transaction.entity";
import { Timestamp } from "firebase-admin/firestore";

const mockDate = new Date("2024-01-15T10:30:00Z");
const mockTimestamp = Timestamp.fromDate(mockDate);

export const transactionEntityFixture: TransactionEntity = {
  description: "Test transaction",
  paymentLink: "https://example.com/payment",
  notes: "Test notes",
  type: TransactionType.EXPENSE,
  status: TransactionStatus.COMPLETE,
  category: TransactionCategory.Alimentos,
  sourceAccount: "checking",
  destinationAccount: "savings",
  amount: 100.5,
  createdAt: mockTimestamp,
  isRecurrent: true,
};

export const minimalTransactionEntityFixture: TransactionEntity = {
  description: "Minimal transaction",
  type: TransactionType.INCOME,
  status: TransactionStatus.PENDING,
  sourceAccount: "checking",
  amount: 50,
  createdAt: mockTimestamp,
};

export const transferTransactionEntityFixture: TransactionEntity = {
  description: "Transfer between accounts",
  type: TransactionType.TRANSFER,
  status: TransactionStatus.COMPLETE,
  sourceAccount: "checking",
  destinationAccount: "savings",
  amount: 200,
  createdAt: mockTimestamp,
};

export const customCategoryTransactionEntityFixture: TransactionEntity = {
  description: "Custom category transaction",
  type: TransactionType.EXPENSE,
  status: TransactionStatus.COMPLETE,
  category: "Custom Category",
  sourceAccount: "checking",
  amount: 75.25,
  createdAt: mockTimestamp,
};

export const roundTripTransactionEntityFixture: TransactionEntity = {
  description: "Round trip test",
  paymentLink: "https://test.com/pay",
  notes: "Round trip notes",
  type: TransactionType.EXPENSE,
  status: TransactionStatus.PENDING,
  category: TransactionCategory.Servicios,
  sourceAccount: "checking",
  destinationAccount: "credit",
  amount: 150.75,
  createdAt: mockTimestamp,
};

export const getTransactionEntityWithCustomDate = (
  date: Date
): TransactionEntity => ({
  ...transactionEntityFixture,
  createdAt: Timestamp.fromDate(date),
});
