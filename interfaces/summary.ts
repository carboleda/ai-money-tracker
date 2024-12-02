import { Account } from "./account";

export interface GetSummaryResponse {
  accountsBalance: Account[];
  byCategory: { category: string; total: number }[];
  byType: { type: string; total: number }[];
  byAccount: Account[];
}
