import {
  Injectable,
  InjectRepository,
} from "@/app/api/decorators/tsyringe.decorator";
import { TransactionStatus } from "@/app/api/domain/transaction/model/transaction.model";
import { FilterTransactionsService } from "@/app/api/domain/transaction/service/filter-transactions.service";
import { GetAllAccountsService } from "@/app/api/domain/account/service/get-all.service";
import { GetAllRecurringExpensesService } from "@/app/api/domain/recurring-expense/service/get-all-recurring-expenses.service";
import { GetSummaryHistoryService } from "./get-summary-history.service";
import { CalculateCategorySummaryService } from "./calculate-category-summary.service";
import { CalculateTypeSummaryService } from "./calculate-type-summary.service";
import { CalculateRecurringVsVariableService } from "./calculate-recurring-vs-variable.service";
import { CalculateBalanceService } from "./calculate-balance.service";
import { CalculateSummaryTrendsService } from "./calculate-summary-trends.service";
import { CalculateCashflowForecastService } from "./calculate-cashflow-forecast.service";
import { GetSummaryResponseDto } from "../model/summary.dto";
import { CashflowPointDto } from "../model/cashflow-point.dto";
import { SummaryHistoryModel } from "../model/summary-history.model";
import { UserModel } from "@/app/api/domain/user/model/user.model";
import type { UserRepository } from "@/app/api/domain/user/repository/user.repository";
import { getMonthBounds } from "@/config/utils";
import { Env } from "@/config/env";

const monthLabelFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
});

@Injectable()
export class CalculateSummaryDashboardService {
  constructor(
    private readonly filterTransactionsService: FilterTransactionsService,
    private readonly getAllAccountsService: GetAllAccountsService,
    private readonly getAllRecurringExpensesService: GetAllRecurringExpensesService,
    private readonly getSummaryHistoryService: GetSummaryHistoryService,
    private readonly calculateCategorySummaryService: CalculateCategorySummaryService,
    private readonly calculateTypeSummaryService: CalculateTypeSummaryService,
    private readonly calculateRecurringVsVariableService: CalculateRecurringVsVariableService,
    private readonly calculateBalanceService: CalculateBalanceService,
    private readonly calculateSummaryTrendsService: CalculateSummaryTrendsService,
    private readonly calculateCashflowForecastService: CalculateCashflowForecastService,
    @InjectRepository(UserModel)
    private readonly userRepository: UserRepository
  ) {}

  async execute(
    startDate?: Date,
    endDate?: Date
  ): Promise<GetSummaryResponseDto> {
    const currentMonthBounds = getMonthBounds(new Date());
    const effectiveStartDate = startDate ?? currentMonthBounds.start;
    const effectiveEndDate = endDate ?? currentMonthBounds.end;

    const user = await this.userRepository.getExistingUser();
    const settings = user?.settings;
    const forecastHorizonMonths =
      settings?.forecastHorizonMonths ??
      Env.SUMMARY_DEFAULT_FORECAST_HORIZON_MONTHS;
    const forecastBaselineMonths =
      settings?.forecastBaselineMonths ??
      Env.SUMMARY_DEFAULT_FORECAST_BASELINE_MONTHS;
    const recentTransactionsLimit =
      settings?.recentTransactionsLimit ??
      Env.SUMMARY_DEFAULT_RECENT_TRANSACTIONS_LIMIT;
    const historyWindowMonths =
      settings?.historyWindowMonths ?? Env.SUMMARY_DEFAULT_HISTORY_WINDOW_MONTHS;

    // Transactions strictly scoped to the selected period. These drive
    // byCategory, byType, recentTransactions and the period trends — the
    // 12-month cashflow/forecast below is intentionally independent of them.
    const transactions = await this.filterTransactionsService.execute({
      status: TransactionStatus.COMPLETE,
      startDate: effectiveStartDate,
      endDate: effectiveEndDate,
    });

    // Map transactions to include category fallback
    const mappedTransactions = transactions.map((transaction) => ({
      ...transaction,
      category: transaction.category ?? transaction.description,
    }));

    const [
      accountsBalance,
      trailingHistory,
      recurringExpenses,
      byCategory,
      byType,
      recurringVsVariable,
      trends,
    ] = await Promise.all([
      this.getAllAccountsService.execute(),
      this.getSummaryHistoryService.execute(historyWindowMonths),
      this.getAllRecurringExpensesService.execute(),
      this.calculateCategorySummaryService.execute(mappedTransactions),
      this.calculateTypeSummaryService.execute(mappedTransactions),
      this.calculateRecurringVsVariableService.execute(mappedTransactions),
      this.calculateSummaryTrendsService.execute(
        effectiveStartDate,
        effectiveEndDate,
        mappedTransactions
      ),
    ]);

    const totalBalance = await this.calculateBalanceService.execute(
      accountsBalance
    );

    const forecastMonths = await this.calculateCashflowForecastService.execute(
      trailingHistory,
      recurringExpenses.recurringExpensesConfig,
      forecastHorizonMonths,
      forecastBaselineMonths
    );

    const cashflow: CashflowPointDto[] = [
      ...trailingHistory.map((entry) => this.toCashflowPoint(entry)),
      ...forecastMonths,
    ];

    const recentTransactions = [...mappedTransactions]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, recentTransactionsLimit);

    return {
      summary: {
        accountsBalance,
        totalBalance,
        trends,
        cashflow,
        byCategory,
        byType,
        recentTransactions,
        recurringVsVariable,
      },
      transactions: mappedTransactions,
    };
  }

  private toCashflowPoint(entry: SummaryHistoryModel): CashflowPointDto {
    return {
      date: this.toYearMonth(entry.createdAt),
      monthLabel: monthLabelFormatter.format(entry.createdAt),
      incomes: entry.incomes,
      expenses: entry.expenses,
      transfers: entry.transfers,
      netFlow: entry.incomes - entry.expenses,
    };
  }

  private toYearMonth(date: Date): string {
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    return `${date.getFullYear()}-${month}`;
  }
}
