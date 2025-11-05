import { container } from "tsyringe";
import { CreateMonthlySummaryService } from "./service/create-monthly-summary.service";
import { GetSummaryHistoryService } from "./service/get-summary-history.service";
import { CalculateCurrentMonthSummaryService } from "./service/calculate-current-month-summary.service";
import { CalculateSummaryService } from "./service/calculate-summary.service";
import { CalculateCategorySummaryService } from "./service/calculate-category-summary.service";
import { CalculateTypeSummaryService } from "./service/calculate-type-summary.service";
import { CalculateRecurrentVsVariableService } from "./service/calculate-recurrent-vs-variable.service";
import { CalculateBalanceService } from "./service/calculate-balance.service";

export class SummaryModule {
  static register(): void {
    // Register summary services
    container.register(CreateMonthlySummaryService, {
      useClass: CreateMonthlySummaryService,
    });
    container.register(GetSummaryHistoryService, {
      useClass: GetSummaryHistoryService,
    });
    container.register(CalculateCurrentMonthSummaryService, {
      useClass: CalculateCurrentMonthSummaryService,
    });
    container.register(CalculateSummaryService, {
      useClass: CalculateSummaryService,
    });
    container.register(CalculateCategorySummaryService, {
      useClass: CalculateCategorySummaryService,
    });
    container.register(CalculateTypeSummaryService, {
      useClass: CalculateTypeSummaryService,
    });
    container.register(CalculateRecurrentVsVariableService, {
      useClass: CalculateRecurrentVsVariableService,
    });
    container.register(CalculateBalanceService, {
      useClass: CalculateBalanceService,
    });
  }
}
