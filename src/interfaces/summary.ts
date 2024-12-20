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

export interface Summary {
  accountsBalance: Account[];
  byCategory: CategorySummary[];
  byType: TypeSummary[];
  byAccount: Account[];
  totalBalance: number;
}

export interface GetSummaryResponse {
  summary: Summary;
  transactions: Transaction[];
}
