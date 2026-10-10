import "reflect-metadata";
import { container } from "tsyringe";
import { GetRecurringCommitmentByCategoryService } from "../get-recurring-commitment-by-category.service";
import { RecurringExpenseRepository } from "@/app/api/domain/recurring-expense/repository/recurring-expense.repository";
import {
  Frequency,
  RecurringExpenseModel,
} from "@/app/api/domain/recurring-expense/model/recurring-expense.model";
import { getRepositoryToken } from "@/app/api/decorators/tsyringe.decorator";

describe("GetRecurringCommitmentByCategoryService", () => {
  let service: GetRecurringCommitmentByCategoryService;
  let recurringExpenseRepository: RecurringExpenseRepository;

  const buildRecurringExpense = (
    params: Partial<RecurringExpenseModel> & {
      id: string;
      category: RecurringExpenseModel["category"];
      frequency: Frequency;
      amount: number;
    },
  ): RecurringExpenseModel =>
    new RecurringExpenseModel({
      id: params.id,
      description: params.description ?? "Expense",
      category: params.category,
      frequency: params.frequency,
      dueDate: params.dueDate ?? new Date("2024-01-01"),
      disabled: params.disabled,
      amount: params.amount,
    });

  beforeEach(() => {
    const testContainer = container.createChildContainer();

    const mockRepository = {
      getAll: jest.fn().mockResolvedValue([]),
    } as unknown as RecurringExpenseRepository;

    testContainer.register(getRepositoryToken(RecurringExpenseModel), {
      useValue: mockRepository,
    });

    service = testContainer.resolve(GetRecurringCommitmentByCategoryService);
    recurringExpenseRepository = mockRepository;
  });

  afterEach(() => {
    container.clearInstances();
  });

  it("sums monthly-equivalent amounts grouped by category ref", async () => {
    jest.spyOn(recurringExpenseRepository, "getAll").mockResolvedValue([
      buildRecurringExpense({
        id: "1",
        category: "HOME",
        frequency: Frequency.MONTHLY,
        amount: 1000,
      }),
      buildRecurringExpense({
        id: "2",
        category: "HOME",
        frequency: Frequency.YEARLY,
        amount: 1200,
      }),
      buildRecurringExpense({
        id: "3",
        category: "FOOD",
        frequency: Frequency.BIANNUAL,
        amount: 600,
      }),
    ]);

    const result = await service.execute();

    expect(result.get("HOME")).toBe(1100); // 1000 + 1200/12
    expect(result.get("FOOD")).toBe(100); // 600/6
  });

  it("skips disabled recurring expenses", async () => {
    jest.spyOn(recurringExpenseRepository, "getAll").mockResolvedValue([
      buildRecurringExpense({
        id: "1",
        category: "HOME",
        frequency: Frequency.MONTHLY,
        amount: 1000,
        disabled: true,
      }),
    ]);

    const result = await service.execute();

    expect(result.has("HOME")).toBe(false);
  });

  it("handles category stored as a CategorySummary object", async () => {
    jest.spyOn(recurringExpenseRepository, "getAll").mockResolvedValue([
      buildRecurringExpense({
        id: "1",
        category: { ref: "HOME", name: "Home" },
        frequency: Frequency.MONTHLY,
        amount: 500,
      }),
    ]);

    const result = await service.execute();

    expect(result.get("HOME")).toBe(500);
  });

  it("returns an empty map when there are no recurring expenses", async () => {
    const result = await service.execute();

    expect(result.size).toBe(0);
  });
});
