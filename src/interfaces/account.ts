import { Timestamp } from "firebase-admin/firestore";
import {
  AccountModel,
  AccountType,
} from "@/app/api/domain/account/model/account.model";

export const DEFAULT_ICON = "🏦";

export const ACCOUNT_TYPES: { label: string; key: AccountType }[] = [
  { key: AccountType.SAVING, label: "saving" },
  { key: AccountType.CREDIT, label: "credit" },
  { key: AccountType.INVESTMENT, label: "investment" },
];

export interface Account extends AccountModel {
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
