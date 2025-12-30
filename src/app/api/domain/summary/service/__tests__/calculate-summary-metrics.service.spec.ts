import "reflect-metadata";
import { container } from "tsyringe";
import { CalculateSummaryMetricsService } from "../calculate-summary-metrics.service";
import { GetAllAccountsService } from "@/app/api/domain/account/service/get-all.service";
import { TransactionModel } from "@/app/api/domain/transaction/model/transaction.model";
import { SummaryMetricsModel } from "@/app/api/domain/summary/model/summary-metrics.model";
import { AccountModel } from "@/app/api/domain/account/model/account.model";
import {
  basicTransfer,
  transferWithPrefixedDestination,
  pendingTransfer,
  transferWithoutDestination,
  twoIncomeTransactions,
  twoExpenseTransactions,
  twoPendingTransactions,
  mixedTransactions,
  largeNumbers,
} from "@/app/api/domain/transaction/service/__tests__/fixtures/transaction.model.fixture";
import { getSeveralAccountModels } from "@/app/api/domain/notification/service/__tests__/fixtures/account.model.fixture";

describe("CalculateSummaryMetricsService", () => {
  const mockAccounts: AccountModel[] = [];
  let service: CalculateSummaryMetricsService;
  let mockGetAllAccountsService: jest.Mocked<GetAllAccountsService>;

  beforeEach(() => {
    // Create a child container for isolation
    const testContainer = container.createChildContainer();

    // Mock the GetAllAccountsService
    mockGetAllAccountsService = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetAllAccountsService>;

    // Register mock in test container
    testContainer.register(GetAllAccountsService, {
      useValue: mockGetAllAccountsService,
    });

    // Resolve the service with mocked dependencies
    service = testContainer.resolve(CalculateSummaryMetricsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    it("should return zero values when no transactions are provided", async () => {
      mockGetAllAccountsService.execute.mockResolvedValue(mockAccounts);

      const result = await service.execute([]);

      expect(result).toBeInstanceOf(SummaryMetricsModel);
      expect(result.totalIncomes).toBe(0);
      expect(result.totalExpenses).toBe(0);
      expect(result.totalPending).toBe(0);
      expect(result.totalTransfers).toBe(0);
      expect(result.totalBalance).toBe(0);
    });

    it("should calculate total incomes correctly", async () => {
      mockGetAllAccountsService.execute.mockResolvedValue(mockAccounts);

      const result = await service.execute(twoIncomeTransactions);

      expect(result.totalIncomes).toBe(1500);
      expect(result.totalExpenses).toBe(0);
      expect(result.totalPending).toBe(0);
      expect(result.totalTransfers).toBe(0);
    });

    it("should calculate total expenses correctly", async () => {
      mockGetAllAccountsService.execute.mockResolvedValue(mockAccounts);

      const result = await service.execute(twoExpenseTransactions);

      expect(result.totalExpenses).toBe(150);
      expect(result.totalIncomes).toBe(0);
      expect(result.totalPending).toBe(0);
      expect(result.totalTransfers).toBe(0);
    });

    it("should calculate total pending transactions correctly", async () => {
      mockGetAllAccountsService.execute.mockResolvedValue(mockAccounts);

      const result = await service.execute(twoPendingTransactions);

      expect(result.totalPending).toBe(500);
      expect(result.totalIncomes).toBe(0);
      expect(result.totalExpenses).toBe(0);
      expect(result.totalTransfers).toBe(0);
    });

    it("should count transfers when account is not specified", async () => {
      mockGetAllAccountsService.execute.mockResolvedValue(mockAccounts);

      const result = await service.execute([basicTransfer]);

      // Without account parameter, transfer is counted in totalTransfers
      expect(result.totalTransfers).toBe(500);
      expect(result.totalIncomes).toBe(0);
      expect(result.totalExpenses).toBe(0);
      expect(result.totalPending).toBe(0);
    });

    it("should count transfer as expense when account parameter doesn't match destination", async () => {
      mockGetAllAccountsService.execute.mockResolvedValue(mockAccounts);

      const result = await service.execute(
        [transferWithPrefixedDestination],
        "account-1"
      );

      expect(result.totalTransfers).toBe(0);
      expect(result.totalIncomes).toBe(0);
      expect(result.totalExpenses).toBe(500);
    });

    it("should count transfer when account parameter matches destination", async () => {
      mockGetAllAccountsService.execute.mockResolvedValue(mockAccounts);

      const result = await service.execute(
        [transferWithPrefixedDestination],
        "account-2"
      );

      expect(result.totalTransfers).toBe(500);
      expect(result.totalIncomes).toBe(0);
      expect(result.totalExpenses).toBe(0);
    });

    it("should handle mixed transactions correctly", async () => {
      mockGetAllAccountsService.execute.mockResolvedValue(mockAccounts);

      const result = await service.execute(mixedTransactions);

      expect(result.totalIncomes).toBe(2000);
      // Transfer is counted in totalTransfers since no account parameter is provided
      expect(result.totalExpenses).toBe(100);
      expect(result.totalPending).toBe(50);
      expect(result.totalTransfers).toBe(300);
    });

    it("should calculate total balance from accounts", async () => {
      const mockAccounts: AccountModel[] = getSeveralAccountModels(2, [
        { name: "Checking", balance: 1000 },
        { name: "Savings", balance: 5000 },
      ]);

      mockGetAllAccountsService.execute.mockResolvedValue(mockAccounts);

      const transactions: TransactionModel[] = [];
      const result = await service.execute(transactions);

      expect(result.totalBalance).toBe(6000);
    });

    it("should call getAllAccountsService exactly once", async () => {
      mockGetAllAccountsService.execute.mockResolvedValue(mockAccounts);

      const transactions: TransactionModel[] = [];
      await service.execute(transactions);

      expect(mockGetAllAccountsService.execute).toHaveBeenCalledTimes(1);
    });

    it("should handle pending transactions of different types without adding to income/expense", async () => {
      mockGetAllAccountsService.execute.mockResolvedValue(mockAccounts);

      const result = await service.execute([pendingTransfer]);

      expect(result.totalPending).toBe(200);
      expect(result.totalTransfers).toBe(0);
      expect(result.totalIncomes).toBe(0);
      expect(result.totalExpenses).toBe(0);
    });

    it("should handle large numbers correctly", async () => {
      mockGetAllAccountsService.execute.mockResolvedValue(mockAccounts);

      const result = await service.execute(largeNumbers);

      expect(result.totalIncomes).toBe(999999999.99);
      expect(result.totalExpenses).toBe(500000000.5);
    });

    it("should handle negative balances in accounts", async () => {
      const mockAccounts: AccountModel[] = getSeveralAccountModels(2, [
        { name: "Checking", balance: -500 },
        { name: "Savings", balance: 1000 },
      ]);

      mockGetAllAccountsService.execute.mockResolvedValue(mockAccounts);

      const transactions: TransactionModel[] = [];
      const result = await service.execute(transactions);

      expect(result.totalBalance).toBe(500);
    });

    it("should not count transfer when destination account is not provided", async () => {
      mockGetAllAccountsService.execute.mockResolvedValue(mockAccounts);

      const result = await service.execute([transferWithoutDestination]);

      expect(result.totalTransfers).toBe(0);
      expect(result.totalExpenses).toBe(500);
    });
  });
});
