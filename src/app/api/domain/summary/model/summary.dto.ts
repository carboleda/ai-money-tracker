import { AccountModel } from "../../account/model/account.model";
import { TransactionModel } from "../../transaction/model/transaction.model";
import { SummaryHistoryModel } from "./summary-history.model";
import { CategorySummaryDto } from "./category-summary.dto";
import { TypeSummaryDto } from "./type-summary.dto";
import { RecurrentVsVariableDto } from "./recurrent-vs-variable.dto";

export interface GetSummaryResponseDto {
  summary: SummaryDto;
  transactions: TransactionModel[];
}

export interface SummaryDto {
  accountsBalance: AccountModel[];
  transactionsSummaryHistory: SummaryHistoryModel[];
  byCategory: CategorySummaryDto[];
  byType: TypeSummaryDto[];
  recurrentVsVariable: RecurrentVsVariableDto;
  totalBalance: number;
}
