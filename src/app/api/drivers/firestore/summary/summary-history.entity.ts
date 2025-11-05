import { Timestamp } from "firebase-admin/firestore";

export interface SummaryHistoryEntity {
  incomes: number;
  expenses: number;
  transfers: number;
  createdAt: Timestamp;
}
