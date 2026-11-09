import { Injectable } from "@/app/api/decorators/tsyringe.decorator";
import { FilterTransactionsService } from "@/app/api/domain/transaction/service/filter-transactions.service";
import {
  TransactionModel,
  TransactionStatus,
  TransactionType,
} from "@/app/api/domain/transaction/model/transaction.model";
import { MetricTrendDto, SummaryTrendsDto } from "../model/summary-trends.dto";

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class CalculateSummaryTrendsService {
  constructor(
    private readonly filterTransactionsService: FilterTransactionsService
  ) {}

  async execute(
    startDate: Date,
    endDate: Date,
    currentTransactions: TransactionModel[]
  ): Promise<SummaryTrendsDto> {
    const duration = endDate.getTime() - startDate.getTime();
    const previousEndDate = new Date(startDate.getTime() - ONE_DAY_IN_MS);
    const previousStartDate = new Date(previousEndDate.getTime() - duration);

    const previousTransactions = await this.filterTransactionsService.execute({
      status: TransactionStatus.COMPLETE,
      startDate: previousStartDate,
      endDate: previousEndDate,
    });

    const current = this.summarize(currentTransactions);
    const previous = this.summarize(previousTransactions);

    return {
      balance: this.buildTrend(
        current.incomes - current.expenses,
        previous.incomes - previous.expenses
      ),
      incomes: this.buildTrend(current.incomes, previous.incomes),
      expenses: this.buildTrend(current.expenses, previous.expenses),
    };
  }

  private summarize(transactions: TransactionModel[]) {
    return transactions.reduce(
      (acc, transaction) => {
        if (transaction.type === TransactionType.INCOME) {
          acc.incomes += transaction.amount;
        } else if (transaction.type === TransactionType.EXPENSE) {
          acc.expenses += transaction.amount;
        }
        return acc;
      },
      { incomes: 0, expenses: 0 }
    );
  }

  private buildTrend(current: number, previous: number): MetricTrendDto {
    const percentageChange =
      previous === 0 ? 0 : ((current - previous) / Math.abs(previous)) * 100;

    return { current, previous, percentageChange };
  }
}
