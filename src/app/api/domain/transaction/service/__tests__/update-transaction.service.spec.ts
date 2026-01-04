import "reflect-metadata";
import { container } from "tsyringe";
import { UpdateTransactionService } from "../update-transaction.service";
import { TransactionRepository } from "@/app/api/domain/transaction/repository/transaction.repository";
import { TransactionModel } from "@/app/api/domain/transaction/model/transaction.model";
import { getRepositoryToken } from "@/app/api/decorators/tsyringe.decorator";
import {
  transactionModelFixtureWithId,
  updateTransactionInputFixture,
} from "./fixtures/transaction.model.fixture";
import { pubsub } from "@/app/api/helpers/pubsub";
import { ValidateAccountService } from "@/app/api/domain/account/service/validate-account.service";

// Mock pubsub
jest.mock("@/app/api/helpers/pubsub", () => ({
  pubsub: {
    emit: jest.fn(),
    subscribe: jest.fn(),
    unsubscribeAll: jest.fn(),
  },
}));

describe("UpdateTransactionService", () => {
  let service: UpdateTransactionService;
  let transactionRepository: TransactionRepository;

  beforeEach(() => {
    container.clearInstances();
    jest.clearAllMocks();

    // Create mock repository
    const mockRepository: TransactionRepository = {
      update: jest.fn(),
      getById: jest.fn().mockResolvedValue(transactionModelFixtureWithId),
      create: jest.fn(),
      delete: jest.fn(),
      searchTransactions: jest.fn(),
    };

    // Register mocks
    container.register(getRepositoryToken(TransactionModel), {
      useValue: mockRepository,
    });
    container.register(ValidateAccountService, {
      useValue: {
        execute: jest.fn().mockResolvedValue(true),
      } as unknown as ValidateAccountService,
    });

    // Register service
    container.register(UpdateTransactionService, {
      useClass: UpdateTransactionService,
    });

    // Resolve instances
    service = container.resolve(UpdateTransactionService);
    transactionRepository = container.resolve(
      getRepositoryToken(TransactionModel)
    );
  });

  afterEach(() => {
    container.clearInstances();
  });

  it("should call the repository with the correct transaction", async () => {
    await service.execute(updateTransactionInputFixture);

    expect(transactionRepository.update).toHaveBeenCalledWith(
      transactionModelFixtureWithId
    );
    expect(pubsub.emit).toHaveBeenCalledWith(
      "transaction.updated",
      expect.any(Object)
    );
  });

  it("should fail if the transaction does not exist", async () => {
    jest.spyOn(transactionRepository, "getById").mockResolvedValue(null);

    const rejects = expect(
      service.execute(updateTransactionInputFixture)
    ).rejects;
    await rejects.toThrow("Transaction not found");
  });
});
