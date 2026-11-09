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
