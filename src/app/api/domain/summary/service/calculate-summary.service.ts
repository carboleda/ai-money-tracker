import { Injectable } from "@/app/api/decorators/tsyringe.decorator";
import { TransactionStatus } from "@/app/api/domain/transaction/model/transaction.model";
import { FilterTransactionsService } from "@/app/api/domain/transaction/service/filter-transactions.service";
import { GetAllAccountsService } from "@/app/api/domain/account/service/get-all.service";
import { GetSummaryHistoryService } from "./get-summary-history.service";
import { CalculateCategorySummaryService } from "./calculate-category-summary.service";
import { CalculateTypeSummaryService } from "./calculate-type-summary.service";
import { CalculateRecurrentVsVariableService } from "./calculate-recurrent-vs-variable.service";
import { CalculateBalanceService } from "./calculate-balance.service";
import { GetSummaryResponseDto } from "../model/summary.dto";

@Injectable()
export class CalculateSummaryService {
  constructor(
    private readonly filterTransactionsService: FilterTransactionsService,
    private readonly getAllAccountsService: GetAllAccountsService,
    private readonly getSummaryHistoryService: GetSummaryHistoryService,
    private readonly calculateCategorySummaryService: CalculateCategorySummaryService,
    private readonly calculateTypeSummaryService: CalculateTypeSummaryService,
    private readonly calculateRecurrentVsVariableService: CalculateRecurrentVsVariableService,
    private readonly calculateBalanceService: CalculateBalanceService
  ) {}

  async execute(
    startDate?: Date,
    endDate?: Date
  ): Promise<GetSummaryResponseDto> {
    // Get transactions using existing service
    const transactions = await this.filterTransactionsService.execute({
      status: TransactionStatus.COMPLETE,
      startDate,
      endDate,
    });

    // Get accounts using existing service
    const accountsBalance = await this.getAllAccountsService.execute();

    // Get summary history using existing service
    const transactionsSummaryHistory =
      await this.getSummaryHistoryService.execute({
        transactions,
      });

    // Map transactions to include category fallback
    const mappedTransactions = transactions.map((transaction) => ({
      ...transaction,
      category: transaction.category ?? transaction.description,
    }));

    // Calculate all summaries in parallel
    const [byCategory, byType, recurrentVsVariable, totalBalance] =
      await Promise.all([
        this.calculateCategorySummaryService.execute(mappedTransactions),
        this.calculateTypeSummaryService.execute(mappedTransactions),
        this.calculateRecurrentVsVariableService.execute(mappedTransactions),
        this.calculateBalanceService.execute(accountsBalance),
      ]);

    return {
      summary: {
        accountsBalance,
        transactionsSummaryHistory,
        byCategory,
        byType,
        recurrentVsVariable,
        totalBalance,
      },
      transactions: mappedTransactions,
    };
  }
}
