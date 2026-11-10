import "reflect-metadata";
import { CalculateCashflowForecastService } from "../calculate-cashflow-forecast.service";
import { SummaryHistoryModel } from "../../model/summary-history.model";
import { RecurringExpenseOutput } from "@/app/api/domain/recurring-expense/ports/outbound/get-recurring-expenses.port";
import { Frequency } from "@/app/api/domain/recurring-expense/model/recurring-expense.model";

const buildHistory = (
  incomes: number,
  expenses: number,
  monthsAgo: number
): SummaryHistoryModel => {
  const createdAt = new Date();
  createdAt.setMonth(createdAt.getMonth() - monthsAgo);

  return new SummaryHistoryModel({
    id: `history-${monthsAgo}`,
    incomes,
    expenses,
    transfers: 0,
    createdAt,
  });
};

const buildRecurringExpense = (
  amount: number,
  overrides: Partial<RecurringExpenseOutput> = {}
): RecurringExpenseOutput => ({
  id: "recurring-1",
  description: "Rent",
  category: { ref: "HOUSING", name: "Housing" },
  frequency: Frequency.MONTHLY,
  dueDate: new Date().toISOString(),
  disabled: false,
  amount,
  ...overrides,
});

describe("CalculateCashflowForecastService", () => {
  let service: CalculateCashflowForecastService;

  beforeEach(() => {
    service = new CalculateCashflowForecastService();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should project 3 months flagged as forecast", async () => {
    const history = [
      buildHistory(1000, 600, 2),
      buildHistory(1000, 600, 1),
      buildHistory(1000, 600, 0),
    ];

    const result = await service.execute(history, []);

    expect(result).toHaveLength(3);
    expect(result.every((point) => point.isForecast)).toBe(true);
  });

  it("should add recurring monthly bills on top of the rolling average variable expenses", async () => {
    const history = [
      buildHistory(1000, 600, 2),
      buildHistory(1000, 600, 1),
      buildHistory(1000, 600, 0),
    ];
    const recurringExpenses = [buildRecurringExpense(200)];

    const result = await service.execute(history, recurringExpenses);

    // averageExpenses (600) - recurring (200) = 400 variable baseline
    // projected expenses = recurring (200) + variable (400) = 600
    expect(result[0].incomes).toBe(1000);
    expect(result[0].expenses).toBe(600);
    expect(result[0].netFlow).toBe(400);
  });

  it("should ignore disabled and non-monthly recurring expenses", async () => {
    const history = [buildHistory(1000, 600, 0)];
    const recurringExpenses = [
      buildRecurringExpense(200, { disabled: true }),
      buildRecurringExpense(300, { frequency: Frequency.YEARLY }),
    ];

    const result = await service.execute(history, recurringExpenses);

    expect(result[0].expenses).toBe(600);
  });

  it("should not project negative variable expenses when recurring bills exceed the historical average", async () => {
    const history = [buildHistory(1000, 100, 0)];
    const recurringExpenses = [buildRecurringExpense(500)];

    const result = await service.execute(history, recurringExpenses);

    // recurring (500) + variable (max(100 - 500, 0) = 0) = 500
    expect(result[0].expenses).toBe(500);
  });

  it("should return 0 averages when there is no history", async () => {
    const result = await service.execute([], []);

    expect(result[0].incomes).toBe(0);
    expect(result[0].expenses).toBe(0);
  });
});
