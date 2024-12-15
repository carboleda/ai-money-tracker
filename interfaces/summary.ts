import { Account } from "./account";

export interface CategorySummary {
  category: string;
  total: number;
}

export interface TypeSummary {
  type: string;
  total: number;
}

export interface GetSummaryResponse {
  accountsBalance: Account[];
  byCategory: CategorySummary[];
  byType: TypeSummary[];
  byAccount: Account[];
  totalBalance: number;
}
