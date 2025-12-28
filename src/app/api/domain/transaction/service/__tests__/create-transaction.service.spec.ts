import "reflect-metadata";
import { container } from "tsyringe";
import { CreateTransactionService } from "../create-transaction.service";
import { TransactionRepository } from "@/app/api/domain/transaction/repository/transaction.repository";
import { TransactionModel } from "@/app/api/domain/transaction/model/transaction.model";
import { getRepositoryToken } from "@/app/api/decorators/tsyringe.decorator";
import {
  EventTypes,
  TransactionCreatedEvent,
} from "@/app/api/domain/shared/interfaces/account-events.interface";
import { transactionModelFixture } from "./fixtures/transaction.model.fixture";
import { pubsub } from "@/app/api/helpers/pubsub";

// Mock pubsub
jest.mock("@/app/api/helpers/pubsub", () => ({
  pubsub: {
    emit: jest.fn(),
    subscribe: jest.fn(),
    unsubscribeAll: jest.fn(),
  },
}));

describe("CreateTransactionService", () => {
  let service: CreateTransactionService;
  let transactionRepository: TransactionRepository;

  beforeEach(() => {
    container.clearInstances();
    jest.clearAllMocks();

    // Create mock repository
    const mockRepository: TransactionRepository = {
      create: jest.fn(),
      getById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      searchTransactions: jest.fn(),
    };

    // Register mocks
    container.register(getRepositoryToken(TransactionModel), {
      useValue: mockRepository,
    });

    // Register service
    container.register(CreateTransactionService, {
      useClass: CreateTransactionService,
    });

    // Resolve instances
    service = container.resolve(CreateTransactionService);
    transactionRepository = container.resolve(
      getRepositoryToken(TransactionModel)
    );
  });

  afterEach(() => {
    container.clearInstances();
  });

  it("should call the repository create method with correct input", async () => {
    const mockTransactionInput = {
      ...transactionModelFixture,
      id: undefined as never, // Remove id for input
    };
    delete mockTransactionInput.id;

    const mockTransactionId = "mock-transaction-id";
    jest
      .spyOn(transactionRepository, "create")
      .mockResolvedValue(mockTransactionId);

    await service.execute(mockTransactionInput);

    expect(transactionRepository.create).toHaveBeenCalledWith(
      mockTransactionInput
    );
  });

  it("should emit the correct event with transaction data", async () => {
    const mockTransactionInput = {
      ...transactionModelFixture,
      id: undefined as never, // Remove id for input
    };
    delete mockTransactionInput.id;

    const mockTransactionId = "mock-transaction-id";
    jest
      .spyOn(transactionRepository, "create")
      .mockResolvedValue(mockTransactionId);

    await service.execute(mockTransactionInput);

    expect(pubsub.emit).toHaveBeenCalledWith(
      EventTypes.TRANSACTION_CREATED,
      expect.any(TransactionCreatedEvent)
    );

    // Verify the event contains the correct transaction data
    const emitCall = (pubsub.emit as jest.Mock).mock.calls[0];
    const emittedEvent = emitCall[1] as TransactionCreatedEvent;
    expect(emittedEvent.transaction).toEqual({
      ...mockTransactionInput,
      id: mockTransactionId,
    });
  });

  it("should return the transaction ID from the repository", async () => {
    const mockTransactionInput = {
      ...transactionModelFixture,
      id: undefined as never, // Remove id for input
    };
    delete mockTransactionInput.id;

    const mockTransactionId = "mock-transaction-id";
    jest
      .spyOn(transactionRepository, "create")
      .mockResolvedValue(mockTransactionId);

    const result = await service.execute(mockTransactionInput);

    expect(result).toBe(mockTransactionId);
  });

  it("should handle the complete flow correctly", async () => {
    const mockTransactionInput = {
      ...transactionModelFixture,
      id: undefined as never, // Remove id for input
    };
    delete mockTransactionInput.id;

    const mockTransactionId = "mock-transaction-id";
    jest
      .spyOn(transactionRepository, "create")
      .mockResolvedValue(mockTransactionId);

    const result = await service.execute(mockTransactionInput);

    // Verify repository was called
    expect(transactionRepository.create).toHaveBeenCalledTimes(1);
    expect(transactionRepository.create).toHaveBeenCalledWith(
      mockTransactionInput
    );

    // Verify event was emitted
    expect(pubsub.emit).toHaveBeenCalledTimes(1);
    expect(pubsub.emit).toHaveBeenCalledWith(
      EventTypes.TRANSACTION_CREATED,
      expect.any(TransactionCreatedEvent)
    );

    // Verify return value
    expect(result).toBe(mockTransactionId);

    // Verify the event payload
    const emitCall = (pubsub.emit as jest.Mock).mock.calls[0];
    const emittedEvent = emitCall[1] as TransactionCreatedEvent;
    expect(emittedEvent.transaction).toEqual({
      ...mockTransactionInput,
      id: mockTransactionId,
    });
  });

  it("should propagate repository errors", async () => {
    const mockTransactionInput = {
      ...transactionModelFixture,
      id: undefined as never, // Remove id for input
    };
    delete mockTransactionInput.id;

    const repositoryError = new Error("Repository error");
    jest
      .spyOn(transactionRepository, "create")
      .mockRejectedValue(repositoryError);

    await expect(service.execute(mockTransactionInput)).rejects.toThrow(
      "Repository error"
    );

    // Event should not be emitted if repository fails
    expect(pubsub.emit).not.toHaveBeenCalled();
  });
});
