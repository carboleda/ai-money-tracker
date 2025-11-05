import { SummaryHistoryModel } from "../model/summary-history.model";

export interface SummaryHistoryRepository {
  create(summaryHistory: SummaryHistoryModel): Promise<string>;
  getHistorySince(date: Date): Promise<SummaryHistoryModel[]>;
}
