import "reflect-metadata";
import { container } from "tsyringe";
import { DeleteRecurrentExpenseService } from "../delete-recurrent-expense.service";
import { RecurrentExpenseRepository } from "@/app/api/domain/recurrent-expense/repository/recurrent-expense.repository";
import {
  Frequency,
  RecurrentExpenseModel,
} from "@/app/api/domain/recurrent-expense/model/recurrent-expense.model";
import { DomainError } from "@/app/api/domain/shared/errors/domain.error";
import { getRepositoryToken } from "@/app/api/decorators/tsyringe.decorator";

describe("DeleteRecurrentExpenseService", () => {
  let service: DeleteRecurrentExpenseService;
  let recurrentExpenseRepository: RecurrentExpenseRepository;

  beforeEach(() => {
    const testContainer = container.createChildContainer();

    const mockRepository = {
      getById: jest.fn(),
      delete: jest.fn(),
    } as unknown as RecurrentExpenseRepository;

    testContainer.register(getRepositoryToken(RecurrentExpenseModel), {
      useValue: mockRepository,
    });

    service = testContainer.resolve(DeleteRecurrentExpenseService);
    recurrentExpenseRepository = mockRepository;
  });

  afterEach(() => {
    container.clearInstances();
  });

  it("should delete a recurring expense successfully", async () => {
    const existingExpense = new RecurrentExpenseModel({
      id: "1",
      description: "Monthly Rent",
      category: "Housing",
      frequency: Frequency.MONTHLY,
      dueDate: new Date("2024-01-01"),
      amount: 1000,
    });

    jest
      .spyOn(recurrentExpenseRepository, "getById")
      .mockResolvedValue(existingExpense);
    jest.spyOn(recurrentExpenseRepository, "delete").mockResolvedValue();

    await service.execute("1");

    expect(recurrentExpenseRepository.getById).toHaveBeenCalledWith("1");
    expect(recurrentExpenseRepository.delete).toHaveBeenCalledWith("1");
  });

  it("should throw error when ID is empty", async () => {
    await expect(service.execute("")).rejects.toThrow(DomainError);
    await expect(service.execute("")).rejects.toThrow(
      "Recurrent expense ID is required"
    );
  });

  it("should throw error when recurring expense does not exist", async () => {
    jest.spyOn(recurrentExpenseRepository, "getById").mockResolvedValue(null);

    await expect(service.execute("non-existent-id")).rejects.toThrow(
      DomainError
    );
    await expect(service.execute("non-existent-id")).rejects.toThrow(
      "Recurrent expense not found"
    );
  });
});
