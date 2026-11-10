import { TransactionOutput } from "@/app/api/domain/transaction/ports/outbound/filter-transactions.port";
import { Account } from "./account";

export interface CategorySummary {
  category: string;
  total: number;
}

export interface TypeSummary {
  type: string;
  total: number;
}

export interface RecurringVsVariableEntry {
  value: number;
  type: "recurrent" | "variable";
}

export interface RecurringVsVariable {
  count: RecurringVsVariableEntry[];
  total: RecurringVsVariableEntry[];
}

export interface MetricTrend {
  current: number;
  previous: number;
  percentageChange: number;
}

export interface SummaryTrends {
  balance: MetricTrend;
  incomes: MetricTrend;
  expenses: MetricTrend;
}

export interface CashflowPoint {
  date: string;
  monthLabel: string;
  incomes: number;
  expenses: number;
  transfers: number;
  netFlow: number;
  isForecast?: boolean;
}

export interface Summary {
  accountsBalance: Account[];
  totalBalance: number;
  trends: SummaryTrends;
  cashflow: CashflowPoint[];
  byCategory: CategorySummary[];
  byType: TypeSummary[];
  recentTransactions: TransactionOutput[];
  recurringVsVariable: RecurringVsVariable;
}

export interface GetSummaryResponse {
  summary: Summary;
  transactions: TransactionOutput[];
}
