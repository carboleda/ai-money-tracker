import {
  Injectable,
  InjectRepository,
} from "@/app/api/decorators/tsyringe.decorator";
import { Service } from "@/app/api/domain/shared/ports/service.interface";
import type { SummaryHistoryRepository } from "../repository/summary-history.repository";
import { SummaryHistoryModel } from "../model/summary-history.model";
import {
  GetSummaryHistoryInput,
  GetSummaryHistoryOutput,
} from "@/app/api/domain/shared/interfaces/summary-history.interface";
import { CalculateCurrentMonthSummaryService } from "./calculate-current-month-summary.service";

@Injectable()
export class GetSummaryHistoryService
  implements Service<GetSummaryHistoryInput, GetSummaryHistoryOutput> {
  constructor(
    @InjectRepository(SummaryHistoryModel)
    private readonly summaryHistoryRepository: SummaryHistoryRepository,
    private readonly calculateCurrentMonthSummaryService: CalculateCurrentMonthSummaryService
  ) { }

  async execute(
    input: GetSummaryHistoryInput
  ): Promise<GetSummaryHistoryOutput> {
    const { transactions } = input;

    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    twelveMonthsAgo.setDate(15);

    const history = await this.summaryHistoryRepository.getHistorySince(
      twelveMonthsAgo
    );

    // Add current month summary
    const currentMonthSummary =
      await this.calculateCurrentMonthSummaryService.execute(transactions);
    history.push(currentMonthSummary);

    return history;
  }
}
