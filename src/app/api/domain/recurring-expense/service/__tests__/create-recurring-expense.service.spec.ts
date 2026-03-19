import "reflect-metadata";
import { container } from "tsyringe";
import { CreateRecurringExpenseService } from "../create-recurring-expense.service";
import { RecurringExpenseRepository } from "@/app/api/domain/recurring-expense/repository/recurring-expense.repository";
import {
  Frequency,
  RecurringExpenseModel,
} from "@/app/api/domain/recurring-expense/model/recurring-expense.model";
import type { CreateRecurringExpenseInput } from "@/app/api/domain/recurring-expense/ports/inbound/create-recurring-expense.port";
import { DomainError } from "@/app/api/domain/shared/errors/domain.error";
import { getRepositoryToken } from "@/app/api/decorators/tsyringe.decorator";

describe("CreateRecurringExpenseService", () => {
  let service: CreateRecurringExpenseService;
  let recurringExpenseRepository: RecurringExpenseRepository;

  beforeEach(() => {
    const testContainer = container.createChildContainer();

    const mockRepository = {
      create: jest.fn(),
    } as unknown as RecurringExpenseRepository;

    testContainer.register(getRepositoryToken(RecurringExpenseModel), {
      useValue: mockRepository,
    });

    service = testContainer.resolve(CreateRecurringExpenseService);
    recurringExpenseRepository = mockRepository;
  });

  afterEach(() => {
    container.clearInstances();
  });

  it("should create a new recurring expense successfully", async () => {
    const input: CreateRecurringExpenseInput = {
      description: "Monthly Rent",
      category: "Housing",
      frequency: Frequency.MONTHLY,
      dueDate: new Date("2024-01-01"),
      amount: 1000,
      paymentLink: "https://example.com",
      notes: "Monthly rent payment",
    };

    jest
      .spyOn(recurringExpenseRepository, "create")
      .mockResolvedValue("new-id");

    const result = await service.execute(input);

    expect(recurringExpenseRepository.create).toHaveBeenCalled();
    expect(result).toBe("new-id");
  });

  it("should throw error when required fields are missing", async () => {
    const input: CreateRecurringExpenseInput = {
      description: "",
      category: "Housing",
      frequency: Frequency.MONTHLY,
      dueDate: new Date("2024-01-01"),
      amount: 1000,
    };

    await expect(service.execute(input)).rejects.toThrow(DomainError);
  });

  it("should throw error when amount is invalid", async () => {
    const input: CreateRecurringExpenseInput = {
      description: "Monthly Rent",
      category: "Housing",
      frequency: Frequency.MONTHLY,
      dueDate: new Date("2024-01-01"),
      amount: 0,
    };

    await expect(service.execute(input)).rejects.toThrow(DomainError);
  });
});
