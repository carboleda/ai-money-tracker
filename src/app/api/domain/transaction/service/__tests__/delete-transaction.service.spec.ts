import "reflect-metadata";
import { container } from "tsyringe";
import { DeleteTransactionService } from "@/app/api/domain/transaction/service/delete-transaction.service";
import { TransactionRepository } from "@/app/api/domain/transaction/repository/transaction.repository";
import { TransactionModel } from "../../model/transaction.model";
import { getRepositoryToken } from "@/app/api/decorators/tsyringe.decorator";
import { transactionModelFixtureWithId } from "./fixtures/transaction.model.fixture";

// Mock pubsub
jest.mock("@/app/api/helpers/pubsub", () => ({
  pubsub: {
    emit: jest.fn(),
    subscribe: jest.fn(),
    unsubscribeAll: jest.fn(),
  },
}));

describe("DeleteTransactionService", () => {
  let service: DeleteTransactionService;
  let transactionRepository: TransactionRepository;

  beforeEach(() => {
    container.clearInstances();
    jest.clearAllMocks();

    // Create mock repository
    const mockRepository: TransactionRepository = {
      delete: jest.fn(),
      getById: jest.fn().mockResolvedValue(transactionModelFixtureWithId),
      create: jest.fn(),
      update: jest.fn(),
      searchTransactions: jest.fn(),
    };

    // Register mocks
    container.register(getRepositoryToken(TransactionModel), {
      useValue: mockRepository,
    });

    // Register service
    container.register(DeleteTransactionService, {
      useClass: DeleteTransactionService,
    });

    // Resolve instances
    service = container.resolve(DeleteTransactionService);
    transactionRepository = container.resolve(
      getRepositoryToken(TransactionModel)
    );
  });

  afterEach(() => {
    container.clearInstances();
  });

  it("should call the repository with the correct id", async () => {
    const mockId = "1";

    await service.execute(mockId);

    expect(transactionRepository.delete).toHaveBeenCalledWith(mockId);
  });

  it("should fail if the transaction does not exist", async () => {
    const id = "non-existent-id";
    jest.spyOn(transactionRepository, "getById").mockResolvedValue(null);

    const rejects = expect(service.execute(id)).rejects;
    await rejects.toThrow("Transaction not found");
  });
});
