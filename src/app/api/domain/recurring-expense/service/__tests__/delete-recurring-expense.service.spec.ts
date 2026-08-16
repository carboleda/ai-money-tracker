import "reflect-metadata";
import { container } from "tsyringe";
import { DeleteRecurringExpenseService } from "../delete-recurring-expense.service";
import { RecurringExpenseRepository } from "@/app/api/domain/recurring-expense/repository/recurring-expense.repository";
import {
  Frequency,
  RecurringExpenseModel,
} from "@/app/api/domain/recurring-expense/model/recurring-expense.model";
import { DomainError } from "@/app/api/domain/shared/errors/domain.error";
import { getRepositoryToken } from "@/app/api/decorators/tsyringe.decorator";

describe("DeleteRecurringExpenseService", () => {
  let service: DeleteRecurringExpenseService;
  let recurringExpenseRepository: RecurringExpenseRepository;

  beforeEach(() => {
    const testContainer = container.createChildContainer();

    const mockRepository = {
      getById: jest.fn(),
      delete: jest.fn(),
    } as unknown as RecurringExpenseRepository;

    testContainer.register(getRepositoryToken(RecurringExpenseModel), {
      useValue: mockRepository,
    });

    service = testContainer.resolve(DeleteRecurringExpenseService);
    recurringExpenseRepository = mockRepository;
  });

  afterEach(() => {
    container.clearInstances();
  });

  it("should delete a recurring expense successfully", async () => {
    const existingExpense = new RecurringExpenseModel({
      id: "1",
      description: "Monthly Rent",
      category: "Housing",
      frequency: Frequency.MONTHLY,
      dueDate: new Date("2024-01-01"),
      amount: 1000,
    });

    jest
      .spyOn(recurringExpenseRepository, "getById")
      .mockResolvedValue(existingExpense);
    jest.spyOn(recurringExpenseRepository, "delete").mockResolvedValue();

    await service.execute("1");

    expect(recurringExpenseRepository.getById).toHaveBeenCalledWith("1");
    expect(recurringExpenseRepository.delete).toHaveBeenCalledWith("1");
  });

  it("should throw error when ID is empty", async () => {
    await expect(service.execute("")).rejects.toThrow(DomainError);
    await expect(service.execute("")).rejects.toThrow(
      "Recurring expense ID is required",
    );
  });

  it("should throw error when recurring expense does not exist", async () => {
    jest.spyOn(recurringExpenseRepository, "getById").mockResolvedValue(null);

    await expect(service.execute("non-existent-id")).rejects.toThrow(
      DomainError,
    );
    await expect(service.execute("non-existent-id")).rejects.toThrow(
      "Recurring expense not found",
    );
  });
});
