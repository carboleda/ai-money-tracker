import { TransactionModel } from "../transaction/model/transaction.model";
import { SummaryHistoryModel } from "../summary/model/summary-history.model";

export interface GetSummaryHistoryInput {
  transactions: TransactionModel[];
}

export interface MonthlySummaryCalculation {
  incomes: number;
  expenses: number;
  transfers: number;
}

export type GetSummaryHistoryOutput = SummaryHistoryModel[];
