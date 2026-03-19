import { TransactionOutput } from "@/app/api/domain/transaction/ports/outbound/filter-transactions.port";
import { Account, TransactionsSummaryHistory } from "./account";

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

export interface Summary {
  accountsBalance: Account[];
  transactionsSummaryHistory: TransactionsSummaryHistory[];
  byCategory: CategorySummary[];
  byType: TypeSummary[];
  recurringVsVariable: RecurringVsVariable;
  totalBalance: number;
}

export interface GetSummaryResponse {
  summary: Summary;
  transactions: TransactionOutput[];
}
