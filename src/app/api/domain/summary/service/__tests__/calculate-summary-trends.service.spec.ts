import "reflect-metadata";
import { container } from "tsyringe";
import { CalculateSummaryTrendsService } from "../calculate-summary-trends.service";
import { FilterTransactionsService } from "@/app/api/domain/transaction/service/filter-transactions.service";
import {
  TransactionStatus,
  TransactionType,
} from "@/app/api/domain/transaction/model/transaction.model";
import { getSeveralTransactionModels } from "@/app/api/domain/transaction/service/__tests__/fixtures/transaction.model.fixture";

describe("CalculateSummaryTrendsService", () => {
  let service: CalculateSummaryTrendsService;
  let filterTransactionsService: jest.Mocked<FilterTransactionsService>;

  beforeEach(() => {
    const testContainer = container.createChildContainer();

    const mockFilterTransactionsService = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<FilterTransactionsService>;

    testContainer.register(FilterTransactionsService, {
      useValue: mockFilterTransactionsService,
    });

    service = testContainer.resolve(CalculateSummaryTrendsService);
    filterTransactionsService = mockFilterTransactionsService;
  });

  afterEach(() => {
    container.clearInstances();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should query the equal-length prior period immediately before the selected range", async () => {
    filterTransactionsService.execute.mockResolvedValue([]);

    const startDate = new Date("2026-02-10T00:00:00Z");
    const endDate = new Date("2026-02-20T00:00:00Z");

    await service.execute(startDate, endDate, []);

    expect(filterTransactionsService.execute).toHaveBeenCalledWith({
      status: TransactionStatus.COMPLETE,
      startDate: new Date("2026-01-30T00:00:00Z"),
      endDate: new Date("2026-02-09T00:00:00Z"),
    });
  });

  it("should calculate percentage change for balance, incomes and expenses", async () => {
    const currentTransactions = getSeveralTransactionModels(2, [
      {
        type: TransactionType.INCOME,
        status: TransactionStatus.COMPLETE,
        amount: 1200,
      },
      {
        type: TransactionType.EXPENSE,
        status: TransactionStatus.COMPLETE,
        amount: 400,
      },
    ]);
    const previousTransactions = getSeveralTransactionModels(2, [
      {
        type: TransactionType.INCOME,
        status: TransactionStatus.COMPLETE,
        amount: 1000,
      },
      {
        type: TransactionType.EXPENSE,
        status: TransactionStatus.COMPLETE,
        amount: 500,
      },
    ]);

    filterTransactionsService.execute.mockResolvedValue(previousTransactions);

    const result = await service.execute(
      new Date("2026-02-01T00:00:00Z"),
      new Date("2026-02-28T23:59:59Z"),
      currentTransactions
    );

    expect(result).toEqual({
      balance: { current: 800, previous: 500, percentageChange: 60 },
      incomes: { current: 1200, previous: 1000, percentageChange: 20 },
      expenses: { current: 400, previous: 500, percentageChange: -20 },
    });
  });

  it("should return 0 percentage change when the previous value is 0", async () => {
    const currentTransactions = getSeveralTransactionModels(1, [
      {
        type: TransactionType.INCOME,
        status: TransactionStatus.COMPLETE,
        amount: 500,
      },
    ]);

    filterTransactionsService.execute.mockResolvedValue([]);

    const result = await service.execute(
      new Date("2026-02-01T00:00:00Z"),
      new Date("2026-02-28T23:59:59Z"),
      currentTransactions
    );

    expect(result.incomes).toEqual({
      current: 500,
      previous: 0,
      percentageChange: 0,
    });
  });
});
