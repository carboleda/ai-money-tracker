import "reflect-metadata";
import { container } from "tsyringe";
import { UpdateRecurrentExpenseService } from "../update-recurrent-expense.service";
import { RecurrentExpenseRepository } from "@/app/api/domain/recurrent-expense/repository/recurrent-expense.repository";
import {
  Frequency,
  RecurrentExpenseModel,
} from "@/app/api/domain/recurrent-expense/model/recurrent-expense.model";
import { DomainError } from "@/app/api/domain/shared/errors/domain.error";
import { getRepositoryToken } from "@/app/api/decorators/tsyringe.decorator";

describe("UpdateRecurrentExpenseService", () => {
  let service: UpdateRecurrentExpenseService;
  let recurrentExpenseRepository: RecurrentExpenseRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    const testContainer = container.createChildContainer();

    const mockRepository = {
      update: jest.fn(),
    } as unknown as RecurrentExpenseRepository;

    testContainer.register(getRepositoryToken(RecurrentExpenseModel), {
      useValue: mockRepository,
    });

    service = testContainer.resolve(UpdateRecurrentExpenseService);
    recurrentExpenseRepository = mockRepository;
  });

  afterEach(() => {
    container.clearInstances();
  });

  it("should update a recurring expense successfully", async () => {
    const input = new RecurrentExpenseModel({
      id: "1",
      description: "Updated Monthly Rent",
      category: "Housing",
      frequency: Frequency.MONTHLY,
      dueDate: new Date("2024-01-01"),
      amount: 1200,
      paymentLink: "https://example.com",
      notes: "Updated monthly rent payment",
    });

    jest.spyOn(recurrentExpenseRepository, "update").mockResolvedValue();

    await service.execute(input);

    expect(recurrentExpenseRepository.update).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "1",
        description: "Updated Monthly Rent",
        amount: 1200,
      })
    );
  });

  it("should convert dueDate string to Date object", async () => {
    const input = new RecurrentExpenseModel({
      id: "1",
      description: "Monthly Rent",
      category: "Housing",
      frequency: Frequency.MONTHLY,
      dueDate: new Date("2024-01-01"),
      amount: 1000,
    });

    jest.spyOn(recurrentExpenseRepository, "update").mockResolvedValue();

    await service.execute(input);

    expect(recurrentExpenseRepository.update).toHaveBeenCalledWith(
      expect.objectContaining({
        dueDate: expect.any(Date),
      })
    );
  });

  it("should throw error when ID is missing", async () => {
    const input = new RecurrentExpenseModel({
      id: "",
      description: "Monthly Rent",
      category: "Housing",
      frequency: Frequency.MONTHLY,
      dueDate: new Date("2024-01-01"),
      amount: 1000,
    });

    await expect(service.execute(input)).rejects.toThrow(DomainError);
    await expect(service.execute(input)).rejects.toThrow(
      "Recurrent expense ID is required"
    );
  });

  it("should throw error when description is missing", async () => {
    const input = new RecurrentExpenseModel({
      id: "1",
      description: "",
      category: "Housing",
      frequency: Frequency.MONTHLY,
      dueDate: new Date("2024-01-01"),
      amount: 1000,
    });

    await expect(service.execute(input)).rejects.toThrow(DomainError);
    await expect(service.execute(input)).rejects.toThrow(
      "Missing required fields"
    );
  });

  it("should throw error when category is missing", async () => {
    const input = new RecurrentExpenseModel({
      id: "1",
      description: "Monthly Rent",
      category: "",
      frequency: Frequency.MONTHLY,
      dueDate: new Date("2024-01-01"),
      amount: 1000,
    });

    await expect(service.execute(input)).rejects.toThrow(DomainError);
    await expect(service.execute(input)).rejects.toThrow(
      "Missing required fields"
    );
  });

  it("should throw error when amount is zero", async () => {
    const input = new RecurrentExpenseModel({
      id: "1",
      description: "Monthly Rent",
      category: "Housing",
      frequency: Frequency.MONTHLY,
      dueDate: new Date("2024-01-01"),
      amount: 0,
    });

    await expect(service.execute(input)).rejects.toThrow(DomainError);
    await expect(service.execute(input)).rejects.toThrow(
      "Amount must be greater than 0"
    );
  });

  it("should throw error when amount is negative", async () => {
    const input = new RecurrentExpenseModel({
      id: "1",
      description: "Monthly Rent",
      category: "Housing",
      frequency: Frequency.MONTHLY,
      dueDate: new Date("2024-01-01"),
      amount: -100,
    });

    await expect(service.execute(input)).rejects.toThrow(DomainError);
    await expect(service.execute(input)).rejects.toThrow(
      "Amount must be greater than 0"
    );
  });
});
