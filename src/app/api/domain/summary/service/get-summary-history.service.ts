import {
  Injectable,
  InjectRepository,
} from "@/app/api/decorators/tsyringe.decorator";
import type { SummaryHistoryRepository } from "../repository/summary-history.repository";
import { SummaryHistoryModel } from "../model/summary-history.model";
import { CalculateCurrentMonthSummaryService } from "./calculate-current-month-summary.service";
import { FilterTransactionsService } from "@/app/api/domain/transaction/service/filter-transactions.service";
import { TransactionStatus } from "@/app/api/domain/transaction/model/transaction.model";
import { getMonthBounds } from "@/config/utils";
import { Env } from "@/config/env";

@Injectable()
export class GetSummaryHistoryService {
  constructor(
    @InjectRepository(SummaryHistoryModel)
    private readonly summaryHistoryRepository: SummaryHistoryRepository,
    private readonly calculateCurrentMonthSummaryService: CalculateCurrentMonthSummaryService,
    private readonly filterTransactionsService: FilterTransactionsService
  ) { }

  async execute(
    windowMonths: number = Env.SUMMARY_DEFAULT_HISTORY_WINDOW_MONTHS
  ): Promise<SummaryHistoryModel[]> {
    const windowStart = new Date();
    windowStart.setMonth(windowStart.getMonth() - windowMonths);
    windowStart.setDate(15);

    const history = await this.summaryHistoryRepository.getHistorySince(
      windowStart
    );

    // The current month hasn't been archived yet, so it's computed live
    // from its own full-month window rather than any caller-supplied range.
    const currentMonthBounds = getMonthBounds(new Date());
    const currentMonthTransactions = await this.filterTransactionsService.execute({
      status: TransactionStatus.COMPLETE,
      startDate: currentMonthBounds.start,
      endDate: currentMonthBounds.end,
    });

    const currentMonthSummary =
      await this.calculateCurrentMonthSummaryService.execute(
        currentMonthTransactions
      );
    history.push(currentMonthSummary);

    return history;
  }
}
