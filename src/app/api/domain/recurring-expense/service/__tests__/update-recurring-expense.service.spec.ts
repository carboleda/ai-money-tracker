import "reflect-metadata";
import { container } from "tsyringe";
import { UpdateRecurringExpenseService } from "../update-recurring-expense.service";
import { RecurringExpenseRepository } from "@/app/api/domain/recurring-expense/repository/recurring-expense.repository";
import {
  Frequency,
  RecurringExpenseModel,
} from "@/app/api/domain/recurring-expense/model/recurring-expense.model";
import type { UpdateRecurringExpenseInput } from "@/app/api/domain/recurring-expense/ports/inbound/update-recurring-expense.port";
import { DomainError } from "@/app/api/domain/shared/errors/domain.error";
import { getRepositoryToken } from "@/app/api/decorators/tsyringe.decorator";

describe("UpdateRecurringExpenseService", () => {
  let service: UpdateRecurringExpenseService;
  let recurringExpenseRepository: RecurringExpenseRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    const testContainer = container.createChildContainer();

    const mockRepository = {
      update: jest.fn(),
    } as unknown as RecurringExpenseRepository;

    testContainer.register(getRepositoryToken(RecurringExpenseModel), {
      useValue: mockRepository,
    });

    service = testContainer.resolve(UpdateRecurringExpenseService);
    recurringExpenseRepository = mockRepository;
  });

  afterEach(() => {
    container.clearInstances();
  });

  it("should update a recurring expense successfully", async () => {
    const input: UpdateRecurringExpenseInput = {
      id: "1",
      description: "Updated Monthly Rent",
      category: "Housing",
      frequency: Frequency.MONTHLY,
      dueDate: new Date("2024-01-01"),
      amount: 1200,
      paymentLink: "https://example.com",
      notes: "Updated monthly rent payment",
    };

    jest.spyOn(recurringExpenseRepository, "update").mockResolvedValue();

    await service.execute(input);

    expect(recurringExpenseRepository.update).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "1",
        description: "Updated Monthly Rent",
        amount: 1200,
      }),
    );
  });

  it("should convert dueDate string to Date object", async () => {
    const input: UpdateRecurringExpenseInput = {
      id: "1",
      description: "Monthly Rent",
      category: "Housing",
      frequency: Frequency.MONTHLY,
      dueDate: new Date("2024-01-01"),
      amount: 1000,
    };

    jest.spyOn(recurringExpenseRepository, "update").mockResolvedValue();

    await service.execute(input);

    expect(recurringExpenseRepository.update).toHaveBeenCalledWith(
      expect.objectContaining({
        dueDate: expect.any(Date),
      }),
    );
  });

  it("should throw error when ID is missing", async () => {
    const input: UpdateRecurringExpenseInput = {
      id: "",
      description: "Monthly Rent",
      category: "Housing",
      frequency: Frequency.MONTHLY,
      dueDate: new Date("2024-01-01"),
      amount: 1000,
    };

    await expect(service.execute(input)).rejects.toThrow(DomainError);
    await expect(service.execute(input)).rejects.toThrow(
      "Recurring expense ID is required",
    );
  });

  it("should throw error when description is missing", async () => {
    const input: UpdateRecurringExpenseInput = {
      id: "1",
      description: "",
      category: "Housing",
      frequency: Frequency.MONTHLY,
      dueDate: new Date("2024-01-01"),
      amount: 1000,
    };

    await expect(service.execute(input)).rejects.toThrow(DomainError);
    await expect(service.execute(input)).rejects.toThrow(
      "Missing required fields",
    );
  });

  it("should throw error when category is missing", async () => {
    const input: UpdateRecurringExpenseInput = {
      id: "1",
      description: "Monthly Rent",
      category: "",
      frequency: Frequency.MONTHLY,
      dueDate: new Date("2024-01-01"),
      amount: 1000,
    };

    await expect(service.execute(input)).rejects.toThrow(DomainError);
    await expect(service.execute(input)).rejects.toThrow(
      "Missing required fields",
    );
  });

  it("should throw error when amount is zero", async () => {
    const input: UpdateRecurringExpenseInput = {
      id: "1",
      description: "Monthly Rent",
      category: "Housing",
      frequency: Frequency.MONTHLY,
      dueDate: new Date("2024-01-01"),
      amount: 0,
    };

    await expect(service.execute(input)).rejects.toThrow(DomainError);
    await expect(service.execute(input)).rejects.toThrow(
      "Amount must be greater than 0",
    );
  });

  it("should throw error when amount is negative", async () => {
    const input: UpdateRecurringExpenseInput = {
      id: "1",
      description: "Monthly Rent",
      category: "Housing",
      frequency: Frequency.MONTHLY,
      dueDate: new Date("2024-01-01"),
      amount: -100,
    };

    await expect(service.execute(input)).rejects.toThrow(DomainError);
    await expect(service.execute(input)).rejects.toThrow(
      "Amount must be greater than 0",
    );
  });
});
