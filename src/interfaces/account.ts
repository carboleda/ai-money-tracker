import { Timestamp } from "firebase-admin/firestore";
import { AccountType } from "@/app/api/domain/account/model/account.model";

export interface AccountEntity {
  ref: string; // User-defined reference (e.g., C1408, AFC)
  name: string; // Display name
  balance: number;
  icon: string; // Emoji character
  type: AccountType;
  description?: string;
  isDeleted: boolean;
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
