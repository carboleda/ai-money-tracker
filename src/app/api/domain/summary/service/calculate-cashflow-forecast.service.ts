import { Injectable } from "@/app/api/decorators/tsyringe.decorator";
import { SummaryHistoryModel } from "../model/summary-history.model";
import { CashflowPointDto } from "../model/cashflow-point.dto";
import { RecurringExpenseOutput } from "@/app/api/domain/recurring-expense/ports/outbound/get-recurring-expenses.port";
import { Frequency } from "@/app/api/domain/recurring-expense/model/recurring-expense.model";
import { Env } from "@/config/env";

const monthLabelFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
});

@Injectable()
export class CalculateCashflowForecastService {
  async execute(
    history: SummaryHistoryModel[],
    recurringExpenses: RecurringExpenseOutput[],
    forecastMonths: number = Env.SUMMARY_DEFAULT_FORECAST_HORIZON_MONTHS,
    rollingWindowMonths: number = Env.SUMMARY_DEFAULT_FORECAST_BASELINE_MONTHS
  ): Promise<CashflowPointDto[]> {
    const recentHistory = history.slice(-rollingWindowMonths);
    const averageIncomes = this.average(recentHistory.map((h) => h.incomes));
    const averageExpenses = this.average(
      recentHistory.map((h) => h.expenses)
    );
    const averageTransfers = this.average(
      recentHistory.map((h) => h.transfers)
    );

    const recurringMonthlyTotal = recurringExpenses
      .filter(
        (expense) => expense.frequency === Frequency.MONTHLY && !expense.disabled
      )
      .reduce((total, expense) => total + expense.amount, 0);

    const averageVariableExpenses = Math.max(
      averageExpenses - recurringMonthlyTotal,
      0
    );

    const anchorDate = new Date();

    return Array.from({ length: forecastMonths }, (_, index) => {
      const forecastDate = new Date(
        anchorDate.getFullYear(),
        anchorDate.getMonth() + index + 1,
        1
      );
      const expenses = recurringMonthlyTotal + averageVariableExpenses;

      return {
        date: this.toYearMonth(forecastDate),
        monthLabel: monthLabelFormatter.format(forecastDate),
        incomes: averageIncomes,
        expenses,
        transfers: averageTransfers,
        netFlow: averageIncomes - expenses,
        isForecast: true,
      };
    });
  }

  private average(values: number[]): number {
    if (values.length === 0) {
      return 0;
    }
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  private toYearMonth(date: Date): string {
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    return `${date.getFullYear()}-${month}`;
  }
}
