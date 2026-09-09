import { TransactionModel } from "@/app/api/domain/transaction/model/transaction.model";

export interface TransactionClassification {
  isOverdue: boolean;
  daysDifference: number;
  hoursDifference: number;
}

export function isTransactionOverdue(now: Date, createdAt: Date): boolean {
  return createdAt <= now;
}

export function dateDiffInDays(date1: Date, date2: Date): number {
  const timeDiff = Math.abs(date2.getTime() - date1.getTime());
  return Math.floor(timeDiff / (1000 * 60 * 60 * 24));
}

export function dateDiffInHours(date1: Date, date2: Date): number {
  const timeDiff = Math.abs(date2.getTime() - date1.getTime());
  return Math.floor(timeDiff / (1000 * 60 * 60));
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function classifyTransaction(
  now: Date,
  transaction: TransactionModel
): TransactionClassification {
  const createdAt = transaction.createdAt;
  return {
    isOverdue: isTransactionOverdue(now, createdAt),
    daysDifference: Math.abs(dateDiffInDays(now, createdAt)),
    hoursDifference: Math.abs(dateDiffInHours(now, createdAt)),
  };
}
