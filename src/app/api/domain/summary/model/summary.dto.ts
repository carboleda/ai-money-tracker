import { AccountModel } from "../../account/model/account.model";
import { TransactionModel } from "../../transaction/model/transaction.model";
import { CategorySummaryDto } from "./category-summary.dto";
import { TypeSummaryDto } from "./type-summary.dto";
import { RecurringVsVariableDto } from "./recurring-vs-variable.dto";
import { CashflowPointDto } from "./cashflow-point.dto";
import { SummaryTrendsDto } from "./summary-trends.dto";

export interface GetSummaryResponseDto {
  summary: SummaryDto;
  transactions: TransactionModel[];
}

export interface SummaryDto {
  accountsBalance: AccountModel[];
  totalBalance: number;
  trends: SummaryTrendsDto;
  cashflow: CashflowPointDto[];
  byCategory: CategorySummaryDto[];
  byType: TypeSummaryDto[];
  recentTransactions: TransactionModel[];
  recurringVsVariable: RecurringVsVariableDto;
}
