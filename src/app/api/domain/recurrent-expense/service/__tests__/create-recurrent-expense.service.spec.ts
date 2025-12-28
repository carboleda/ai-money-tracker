import "reflect-metadata";
import { container } from "tsyringe";
import { CreateRecurrentExpenseService } from "../create-recurrent-expense.service";
import { RecurrentExpenseRepository } from "@/app/api/domain/recurrent-expense/repository/recurrent-expense.repository";
import {
  Frequency,
  RecurrentExpenseModel,
} from "@/app/api/domain/recurrent-expense/model/recurrent-expense.model";
import { DomainError } from "@/app/api/domain/shared/errors/domain.error";
import { getRepositoryToken } from "@/app/api/decorators/tsyringe.decorator";

describe("CreateRecurrentExpenseService", () => {
  let service: CreateRecurrentExpenseService;
  let recurrentExpenseRepository: RecurrentExpenseRepository;

  beforeEach(() => {
    const testContainer = container.createChildContainer();

    const mockRepository = {
      create: jest.fn(),
    } as unknown as RecurrentExpenseRepository;

    testContainer.register(getRepositoryToken(RecurrentExpenseModel), {
      useValue: mockRepository,
    });

    service = testContainer.resolve(CreateRecurrentExpenseService);
    recurrentExpenseRepository = mockRepository;
  });

  afterEach(() => {
    container.clearInstances();
  });

  it("should create a new recurring expense successfully", async () => {
    const input = new RecurrentExpenseModel({
      id: "1",
      description: "Monthly Rent",
      category: "Housing",
      frequency: Frequency.MONTHLY,
      dueDate: new Date("2024-01-01"),
      amount: 1000,
      paymentLink: "https://example.com",
      notes: "Monthly rent payment",
    });

    jest
      .spyOn(recurrentExpenseRepository, "create")
      .mockResolvedValue("new-id");

    const result = await service.execute(input);

    expect(recurrentExpenseRepository.create).toHaveBeenCalledWith(input);
    expect(result).toBe("new-id");
  });

  it("should throw error when required fields are missing", async () => {
    const input = new RecurrentExpenseModel({
      id: "1",
      description: "",
      category: "Housing",
      frequency: Frequency.MONTHLY,
      dueDate: new Date("2024-01-01"),
      amount: 1000,
    });

    await expect(service.execute(input)).rejects.toThrow(DomainError);
  });

  it("should throw error when amount is invalid", async () => {
    const input = new RecurrentExpenseModel({
      id: "1",
      description: "Monthly Rent",
      category: "Housing",
      frequency: Frequency.MONTHLY,
      dueDate: new Date("2024-01-01"),
      amount: 0,
    });

    await expect(service.execute(input)).rejects.toThrow(DomainError);
  });
});
