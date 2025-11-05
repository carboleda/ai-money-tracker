import "reflect-metadata";
import { container } from "tsyringe";
import { GeneratedTransaction } from "@/app/api/domain/interfaces/generated-transaction.interface";
import { GenerateTransactionService } from "../generate-transaction.service";
import { GenAIService } from "@/app/api/domain/interfaces/generated-transaction.interface";
import { DomainError } from "@/app/api/domain/errors/domain.error";
import {
  TransactionModel,
  TransactionStatus,
} from "@/app/api/domain/transaction/model/transaction.model";
import { getRepositoryToken } from "@/app/api/decorators/tsyringe.decorator";
import { Utilities } from "@/app/api/helpers/utils";
import { CreateTransactionService } from "../create-transaction.service";

// Mock pubsub
jest.mock("@/app/api/helpers/pubsub", () => ({
  pubsub: {
    emit: jest.fn(),
    subscribe: jest.fn(),
    unsubscribeAll: jest.fn(),
  },
}));

describe("GenerateTransactionService", () => {
  let service: GenerateTransactionService;
  let genAIService: GenAIService;
  let createTransactionService: CreateTransactionService;

  beforeEach(() => {
    container.clearInstances();
    jest.clearAllMocks();

    // Create mocks
    const mockGenAIService: GenAIService = {
      extractData: jest.fn(),
    };

    const mockCreateTransactionService = {
      execute: jest.fn(),
    } as unknown as CreateTransactionService;

    const mockRepository = {
      create: jest.fn(),
      getById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      searchTransactions: jest.fn(),
    };

    // Register mocks
    container.register("GenAIService", {
      useValue: mockGenAIService,
    });

    container.register(CreateTransactionService, {
      useValue: mockCreateTransactionService,
    });

    container.register(getRepositoryToken(TransactionModel), {
      useValue: mockRepository,
    });

    // Register service
    container.register(GenerateTransactionService, {
      useClass: GenerateTransactionService,
    });

    // Resolve instances
    service = container.resolve(GenerateTransactionService);
    createTransactionService = container.resolve(CreateTransactionService);
    genAIService = container.resolve<GenAIService>("GenAIService");
  });

  afterEach(() => {
    container.clearInstances();
  });

  it("should throw an error if neither text nor picture is provided", async () => {
    const rejects = expect(service.execute({})).rejects;
    await rejects.toThrow(DomainError);
    await rejects.toThrow("Either text or picture must be provided");
  });

  it("should throw an error if required fields are missing in the text", async () => {
    jest.spyOn(genAIService, "extractData").mockResolvedValueOnce({
      error: "Missing required fields in the prompt: field1, field2",
    });
    jest
      .spyOn(Utilities, "getMissingFieldsInPrompt")
      .mockReturnValueOnce(["field1", "field2"]);

    const rejects = expect(
      service.execute({ text: "some incomplete text" })
    ).rejects;
    await rejects.toThrow(DomainError);
    await rejects.toThrow(
      "Missing required fields in the prompt: field1, field2"
    );
  });

  it("should call genAIService and createTransactionService with correct data", async () => {
    const mockGeneratedTransaction: GeneratedTransaction.TransactionData = {
      type: "expense",
      sourceAccount: "account1",
      createdAt: "2025-07-25T00:00:00.000Z",
      description: "Test transaction",
      amount: 100,
      category: "Food",
      destinationAccount: "account2",
      error: undefined as never,
    };

    jest
      .spyOn(genAIService, "extractData")
      .mockResolvedValueOnce(mockGeneratedTransaction);

    jest
      .spyOn(createTransactionService, "execute")
      .mockResolvedValueOnce("mock-transaction-id");

    const mockTransaction = {
      ...mockGeneratedTransaction,
      type: mockGeneratedTransaction.type as TransactionModel["type"],
      createdAt: new Date(mockGeneratedTransaction.createdAt!),
      sourceAccount: "account1",
      status: TransactionStatus.COMPLETE,
    };

    const result = await service.execute({
      text: "Payment of internet bill by 20000, C1234",
    });

    expect(genAIService.extractData).toHaveBeenCalledWith(
      "Payment of internet bill by 20000, C1234",
      undefined
    );
    expect(createTransactionService.execute).toHaveBeenCalledWith(
      mockTransaction
    );
    expect(result).toBe("mock-transaction-id");
  });

  it("should call genAIService and createTransactionService with correct data when manual date is provided", async () => {
    const mockGeneratedTransaction: GeneratedTransaction.TransactionData = {
      type: "expense",
      sourceAccount: "account1",
      description: "Test transaction",
      amount: 100,
      category: "Food",
      destinationAccount: "account2",
      error: undefined as never,
    };

    jest
      .spyOn(genAIService, "extractData")
      .mockResolvedValueOnce(mockGeneratedTransaction);

    jest
      .spyOn(createTransactionService, "execute")
      .mockResolvedValueOnce("mock-transaction-id");

    const mockTransaction = {
      ...mockGeneratedTransaction,
      type: mockGeneratedTransaction.type as TransactionModel["type"],
      createdAt: new Date("2025-07-25T00:00:00.000Z"),
      sourceAccount: "account1",
      status: TransactionStatus.COMPLETE,
    };

    const result = await service.execute({
      text: "Payment of internet bill by 20000, C1234",
      createdAtManual: "2025-07-25T00:00:00.000Z",
    });

    expect(genAIService.extractData).toHaveBeenCalledWith(
      "Payment of internet bill by 20000, C1234",
      undefined
    );
    expect(createTransactionService.execute).toHaveBeenCalledWith(
      mockTransaction
    );
    expect(result).toBe("mock-transaction-id");
  });

  it("should fail when generated transaction data is invalid", async () => {
    jest.spyOn(genAIService, "extractData").mockResolvedValueOnce({
      error: "Invalid transaction data received",
    });

    const rejects = expect(
      service.execute({ text: "Payment of internet bill by 20000, C1234" })
    ).rejects;
    await rejects.toThrow(DomainError);
    await rejects.toThrow("Invalid transaction data received");
  });
});
