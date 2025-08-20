import { Timestamp } from "firebase-admin/firestore";

export interface AccountEntity {
  account: string;
  balance: number;
}

export interface Account extends AccountEntity {
  id: string;
}

export interface GetAccountsResponse {
  accounts: Account[];
}
export interface TransactionsSummaryHistoryEntity {
  incomes: number;
  expenses: number;
  transfers: number;
  createdAt: Timestamp;
}

export interface TransactionsSummaryHistory
  extends Omit<TransactionsSummaryHistoryEntity, "createdAt"> {
  id: string;
  createdAt: string;
}

export type ValidAccount = {
  label: string;
  category: string;
  enabled: boolean;
};