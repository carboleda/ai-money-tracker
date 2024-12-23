import { Account } from "./account";
import { Transaction } from "./transaction";

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
  byCategory: CategorySummary[];
  byType: TypeSummary[];
  byAccount: Account[];
  recurrentVsVariable: RecurrentVsVariable;
  totalBalance: number;
}

export interface GetSummaryResponse {
  summary: Summary;
  transactions: Transaction[];
}
