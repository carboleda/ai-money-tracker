import "reflect-metadata";
import { container } from "tsyringe";
import { CalculateSummaryService } from "../calculate-summary.service";
import { FilterTransactionsService } from "../../../transaction/service/filter-transactions.service";
import { GetAllAccountsService } from "../../../account/service/get-all.service";
import { GetSummaryHistoryService } from "../get-summary-history.service";
import { CalculateCategorySummaryService } from "../calculate-category-summary.service";
import { CalculateTypeSummaryService } from "../calculate-type-summary.service";
import { CalculateRecurrentVsVariableService } from "../calculate-recurrent-vs-variable.service";
import { CalculateBalanceService } from "../calculate-balance.service";
import {
  TransactionStatus,
  TransactionType,
} from "../../../transaction/model/transaction.model";

describe("CalculateSummaryService", () => {
  let service: CalculateSummaryService;
  let filterTransactionsService: jest.Mocked<FilterTransactionsService>;
  let getAllAccountsService: jest.Mocked<GetAllAccountsService>;
  let getSummaryHistoryService: jest.Mocked<GetSummaryHistoryService>;
  let calculateCategorySummaryService: jest.Mocked<CalculateCategorySummaryService>;
  let calculateTypeSummaryService: jest.Mocked<CalculateTypeSummaryService>;
  let calculateRecurrentVsVariableService: jest.Mocked<CalculateRecurrentVsVariableService>;
  let calculateBalanceService: jest.Mocked<CalculateBalanceService>;

  beforeEach(() => {
    const testContainer = container.createChildContainer();

    const mockFilterTransactionsService = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<FilterTransactionsService>;
    const mockGetAllAccountsService = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetAllAccountsService>;
    const mockGetSummaryHistoryService = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetSummaryHistoryService>;
    const mockCalculateCategorySummaryService = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<CalculateCategorySummaryService>;
    const mockCalculateTypeSummaryService = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<CalculateTypeSummaryService>;
    const mockCalculateRecurrentVsVariableService = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<CalculateRecurrentVsVariableService>;
    const mockCalculateBalanceService = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<CalculateBalanceService>;

    testContainer.register(FilterTransactionsService, {
      useValue: mockFilterTransactionsService,
    });
    testContainer.register(GetAllAccountsService, {
      useValue: mockGetAllAccountsService,
    });
    testContainer.register(GetSummaryHistoryService, {
      useValue: mockGetSummaryHistoryService,
    });
    testContainer.register(CalculateCategorySummaryService, {
      useValue: mockCalculateCategorySummaryService,
    });
    testContainer.register(CalculateTypeSummaryService, {
      useValue: mockCalculateTypeSummaryService,
    });
    testContainer.register(CalculateRecurrentVsVariableService, {
      useValue: mockCalculateRecurrentVsVariableService,
    });
    testContainer.register(CalculateBalanceService, {
      useValue: mockCalculateBalanceService,
    });

    service = testContainer.resolve(CalculateSummaryService);
    filterTransactionsService = mockFilterTransactionsService;
    getAllAccountsService = mockGetAllAccountsService;
    getSummaryHistoryService = mockGetSummaryHistoryService;
    calculateCategorySummaryService = mockCalculateCategorySummaryService;
    calculateTypeSummaryService = mockCalculateTypeSummaryService;
    calculateRecurrentVsVariableService =
      mockCalculateRecurrentVsVariableService;
    calculateBalanceService = mockCalculateBalanceService;
  });

  afterEach(() => {
    container.clearInstances();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should calculate summary successfully", async () => {
    const mockTransactions = [
      {
        id: "1",
        description: "Test transaction",
        type: TransactionType.EXPENSE,
        status: TransactionStatus.COMPLETE,
        category: "Test Category",
        sourceAccount: "C1",
        amount: 100,
        createdAt: new Date(),
      },
    ];
    const mockAccounts = [
      {
        id: "C1",
        account: "C1",
        balance: 1000,
      },
    ];
    const mockHistory = [
      {
        id: "1",
        incomes: 500,
        expenses: 300,
        transfers: 0,
        createdAt: new Date(),
      },
    ];

    filterTransactionsService.execute.mockResolvedValue(mockTransactions);
    getAllAccountsService.execute.mockResolvedValue(mockAccounts);
    getSummaryHistoryService.execute.mockResolvedValue(mockHistory);
    calculateCategorySummaryService.execute.mockResolvedValue([
      { category: "Test Category", total: -100 },
    ]);
    calculateTypeSummaryService.execute.mockResolvedValue([
      { type: "expense", total: 100 },
    ]);
    calculateRecurrentVsVariableService.execute.mockResolvedValue({
      count: [
        { value: 1, type: "recurrent" },
        { value: 0, type: "variable" },
      ],
      total: [
        { value: 100, type: "recurrent" },
        { value: 0, type: "variable" },
      ],
    });
    calculateBalanceService.execute.mockResolvedValue(1000);

    const result = await service.execute();

    expect(result).toEqual({
      summary: {
        accountsBalance: mockAccounts,
        transactionsSummaryHistory: mockHistory,
        byCategory: [{ category: "Test Category", total: -100 }],
        byType: [{ type: "expense", total: 100 }],
        recurrentVsVariable: {
          count: [
            { value: 1, type: "recurrent" },
            { value: 0, type: "variable" },
          ],
          total: [
            { value: 100, type: "recurrent" },
            { value: 0, type: "variable" },
          ],
        },
        totalBalance: 1000,
      },
      transactions: mockTransactions.map((t) => ({
        ...t,
        category: t.category ?? t.description,
      })),
    });
  });
});
