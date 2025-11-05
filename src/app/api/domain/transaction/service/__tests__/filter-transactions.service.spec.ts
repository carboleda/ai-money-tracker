import "reflect-metadata";
import { container } from "tsyringe";
import { FilterTransactionsService } from "../filter-transactions.service";
import { TransactionRepository } from "@/app/api/domain/transaction/repository/transaction.repository";
import {
  TransactionModel,
  TransactionStatus,
} from "@/app/api/domain/transaction/model/transaction.model";
import { getRepositoryToken } from "@/app/api/decorators/tsyringe.decorator";
import { getSeveralTransactionModels } from "./fixtures/transaction.model.fixture";

describe("FilterTransactionsService", () => {
  let service: FilterTransactionsService;
  let transactionRepository: TransactionRepository;

  beforeEach(() => {
    container.clearInstances();

    // Create mock repository
    const mockRepository: TransactionRepository = {
      searchTransactions: jest.fn(),
      create: jest.fn(),
      getById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    // Register mocks
    container.register(getRepositoryToken(TransactionModel), {
      useValue: mockRepository,
    });

    // Register service
    container.register(FilterTransactionsService, {
      useClass: FilterTransactionsService,
    });

    // Resolve instances
    service = container.resolve(FilterTransactionsService);
    transactionRepository = container.resolve(
      getRepositoryToken(TransactionModel)
    );
  });

  afterEach(() => {
    container.clearInstances();
  });

  it.each([TransactionStatus.COMPLETE, TransactionStatus.PENDING])(
    "should fetch transactions based on filter params when status is %s",
    async (status) => {
      const mockTransactions = getSeveralTransactionModels(2, {
        status: TransactionStatus.COMPLETE,
        sourceAccount: "C1234",
        createdAt: new Date("2025-07-26T00:00:00.000Z"),
      });
      mockTransactions[1].status = TransactionStatus.PENDING;
      jest
        .spyOn(transactionRepository, "searchTransactions")
        .mockResolvedValue(mockTransactions);

      const transactions = await service.execute({
        status,
        account: "C1234",
        startDate: new Date("2025-07-01"),
        endDate: new Date("2025-07-26"),
      });

      expect(transactions).toHaveLength(1);
      expect(transactions[0].status).toBe(status);
    }
  );
});
