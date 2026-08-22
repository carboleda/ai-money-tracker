import { TransactionType } from "@/app/api/domain/transaction/model/transaction.model";
import { CategoryModel } from "../../category/model/category.model";
import { AccountModel } from "../../account/model/account.model";

export interface ParsedTransactionData {
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  sourceAccount: string;
  destinationAccount?: string;
  createdAt?: string;
  confidence: number;
}

export interface ParseTransactionError {
  error: string;
}

export type ParsedTransactionResult =
  | ParsedTransactionData
  | ParseTransactionError
  | null;

export interface GenAIService {
  extractData(
    categories: CategoryModel[],
    accounts: AccountModel[],
    currentDate: string,
    text?: string,
    picture?: string
  ): Promise<ParsedTransactionResult>;
}
