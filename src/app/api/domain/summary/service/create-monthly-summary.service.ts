import {
  Injectable,
  InjectRepository,
} from "@/app/api/decorators/tsyringe.decorator";
import { Service } from "@/app/api/domain/shared/ports/service.interface";
import type { SummaryHistoryRepository } from "../repository/summary-history.repository";
import { SummaryHistoryModel } from "../model/summary-history.model";
import { FilterTransactionsService } from "@/app/api/domain/transaction/service/filter-transactions.service";
import {
  TransactionStatus,
  TransactionType,
  TransactionModel,
} from "@/app/api/domain/transaction/model/transaction.model";
import { getMonthBounds, getPreviousMonth } from "@/config/utils";
import { Env } from "@/config/env";

@Injectable()
export class CreateMonthlySummaryService implements Service<void, void> {
  constructor(
    @InjectRepository(SummaryHistoryModel)
    private readonly summaryHistoryRepository: SummaryHistoryRepository,
    private readonly filterTransactionsService: FilterTransactionsService
  ) { }

  async execute(): Promise<void> {
    const now = new Date();

    // Only run on the 2nd of the month
    if (now.getDate() !== Env.RUN_ON_DAY_OF_MONTH) {
      return;
    }

    const previousMonth = getPreviousMonth(now);
    const bounds = getMonthBounds(previousMonth);

    const transactions = await this.filterTransactionsService.execute({
      status: TransactionStatus.COMPLETE,
      startDate: bounds.start,
      endDate: bounds.end,
    });

    const transactionsByType = this.getSummaryByType(transactions);
    const valueGetter = this.getValueForType(transactionsByType);

    const summaryHistory = {
      incomes: valueGetter(TransactionType.INCOME),
      expenses: valueGetter(TransactionType.EXPENSE),
      transfers: valueGetter(TransactionType.TRANSFER),
      createdAt: bounds.end,
    };

    await this.summaryHistoryRepository.create(summaryHistory);
  }

  private getSummaryByType(transactions: TransactionModel[]) {
    const summary: { [key: string]: number } = {};

    transactions.forEach((transaction) => {
      if (!summary[transaction.type]) {
        summary[transaction.type] = 0;
      }
      summary[transaction.type] += transaction.amount;
    });

    return Object.entries(summary).map(([type, total]) => ({ type, total }));
  }

  private getValueForType(
    transactionsByType: { type: string; total: number }[]
  ) {
    return (type: TransactionType) => {
      return transactionsByType.find((t) => t.type === type)?.total || 0;
    };
  }
}
