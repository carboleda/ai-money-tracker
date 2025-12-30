import { TransactionModel } from "@/app/api/domain/transaction/model/transaction.model";
import { SummaryHistoryModel } from "@/app/api/domain/summary/model/summary-history.model";

export interface GetSummaryHistoryInput {
  transactions: TransactionModel[];
}

export type GetSummaryHistoryOutput = SummaryHistoryModel[];

export interface MonthlySummaryCalculation {
  incomes: number;
  expenses: number;
  transfers: number;
}
