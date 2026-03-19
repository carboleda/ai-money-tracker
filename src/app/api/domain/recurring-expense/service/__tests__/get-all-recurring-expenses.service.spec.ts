import "reflect-metadata";
import { container } from "tsyringe";
import { GetAllRecurringExpensesService } from "../get-all-recurring-expenses.service";
import { RecurringExpenseRepository } from "@/app/api/domain/recurring-expense/repository/recurring-expense.repository";
import {
  RecurringExpenseModel,
  Frequency,
  FrequencyGroup,
} from "@/app/api/domain/recurring-expense/model/recurring-expense.model";
import { getRepositoryToken } from "@/app/api/decorators/tsyringe.decorator";

describe("GetAllRecurringExpensesService", () => {
  let service: GetAllRecurringExpensesService;
  let recurringExpenseRepository: RecurringExpenseRepository;

  beforeEach(() => {
    const testContainer = container.createChildContainer();

    const mockRepository = {
      getAll: jest.fn(),
    } as unknown as RecurringExpenseRepository;

    testContainer.register(getRepositoryToken(RecurringExpenseModel), {
      useValue: mockRepository,
    });

    service = testContainer.resolve(GetAllRecurringExpensesService);
    recurringExpenseRepository = mockRepository;
  });

  afterEach(() => {
    container.clearInstances();
  });

  describe("execute", () => {
    it("should return all recurring expenses with group totals", async () => {
      const mockExpenses = [
        new RecurringExpenseModel({
          id: "1",
          description: "Monthly Rent",
          category: "Housing",
          frequency: Frequency.MONTHLY,
          dueDate: new Date("2024-01-01"),
          amount: 1000,
          disabled: false,
        }),
        new RecurringExpenseModel({
          id: "2",
          description: "Yearly Insurance",
          category: "Insurance",
          frequency: Frequency.YEARLY,
          dueDate: new Date("2024-01-01"),
          amount: 500,
          disabled: false,
        }),
        new RecurringExpenseModel({
          id: "3",
          description: "Disabled Expense",
          category: "Other",
          frequency: Frequency.MONTHLY,
          dueDate: new Date("2024-01-01"),
          amount: 200,
          disabled: true,
        }),
      ];

      jest
        .spyOn(recurringExpenseRepository, "getAll")
        .mockResolvedValue(mockExpenses);

      const result = await service.execute();

      expect(recurringExpenseRepository.getAll).toHaveBeenCalled();
      expect(result.recurringExpensesConfig.length).toBe(mockExpenses.length);
      expect(result.groupTotal).toEqual({
        [FrequencyGroup.MONTHLY]: 1000,
        [FrequencyGroup.OTHERS]: 500,
      });
    });

    it("should handle empty expenses list", async () => {
      jest.spyOn(recurringExpenseRepository, "getAll").mockResolvedValue([]);

      const result = await service.execute();

      expect(result.recurringExpensesConfig).toEqual([]);
      expect(result.groupTotal).toEqual({
        [FrequencyGroup.MONTHLY]: 0,
        [FrequencyGroup.OTHERS]: 0,
      });
    });
  });
});
