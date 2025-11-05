import "reflect-metadata";
import { container } from "tsyringe";
import { GetAllRecurrentExpensesService } from "../get-all-recurrent-expenses.service";
import { RecurrentExpenseRepository } from "@/app/api/domain/recurrent-expense/repository/recurrent-expense.repository";
import {
  RecurrentExpenseModel,
  Frequency,
  FrequencyGroup,
} from "@/app/api/domain/recurrent-expense/model/recurrent-expense.model";
import { getRepositoryToken } from "@/app/api/decorators/tsyringe.decorator";

describe("GetAllRecurrentExpensesService", () => {
  let service: GetAllRecurrentExpensesService;
  let recurrentExpenseRepository: RecurrentExpenseRepository;

  beforeEach(() => {
    const testContainer = container.createChildContainer();

    const mockRepository = {
      getAll: jest.fn(),
    } as unknown as RecurrentExpenseRepository;

    testContainer.register(getRepositoryToken(RecurrentExpenseModel), {
      useValue: mockRepository,
    });

    service = testContainer.resolve(GetAllRecurrentExpensesService);
    recurrentExpenseRepository = mockRepository;
  });

  afterEach(() => {
    container.clearInstances();
  });

  describe("execute", () => {
    it("should return all recurring expenses with group totals", async () => {
      const mockExpenses = [
        new RecurrentExpenseModel({
          id: "1",
          description: "Monthly Rent",
          category: "Housing",
          frequency: Frequency.MONTHLY,
          dueDate: new Date("2024-01-01"),
          amount: 1000,
          disabled: false,
        }),
        new RecurrentExpenseModel({
          id: "2",
          description: "Yearly Insurance",
          category: "Insurance",
          frequency: Frequency.YEARLY,
          dueDate: new Date("2024-01-01"),
          amount: 500,
          disabled: false,
        }),
        new RecurrentExpenseModel({
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
        .spyOn(recurrentExpenseRepository, "getAll")
        .mockResolvedValue(mockExpenses);

      const result = await service.execute();

      expect(recurrentExpenseRepository.getAll).toHaveBeenCalled();
      expect(result.recurringExpenses).toEqual(mockExpenses);
      expect(result.groupTotal).toEqual({
        [FrequencyGroup.MONTHLY]: 1000,
        [FrequencyGroup.OTHERS]: 500,
      });
    });

    it("should handle empty expenses list", async () => {
      jest.spyOn(recurrentExpenseRepository, "getAll").mockResolvedValue([]);

      const result = await service.execute();

      expect(result.recurringExpenses).toEqual([]);
      expect(result.groupTotal).toEqual({
        [FrequencyGroup.MONTHLY]: 0,
        [FrequencyGroup.OTHERS]: 0,
      });
    });
  });
});
