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

export interface RecurrentVsVariableEntry {
  value: number;
  type: "recurrent" | "variable";
}

export interface RecurrentVsVariable {
  count: RecurrentVsVariableEntry[];
  total: RecurrentVsVariableEntry[];
}

export interface Summary {
  accountsBalance: Account[];
  transactionsSummaryHistory: TransactionsSummaryHistory[];
  byCategory: CategorySummary[];
  byType: TypeSummary[];
  recurrentVsVariable: RecurrentVsVariable;
  totalBalance: number;
}

export interface GetSummaryResponse {
  summary: Summary;
  transactions: TransactionOutput[];
}
