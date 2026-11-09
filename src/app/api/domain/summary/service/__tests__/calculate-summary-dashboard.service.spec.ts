import "reflect-metadata";
import { container } from "tsyringe";
import { CalculateSummaryDashboardService } from "../calculate-summary-dashboard.service";
import { FilterTransactionsService } from "@/app/api/domain/transaction/service/filter-transactions.service";
import { GetAllAccountsService } from "@/app/api/domain/account/service/get-all.service";
import { GetAllRecurringExpensesService } from "@/app/api/domain/recurring-expense/service/get-all-recurring-expenses.service";
import { GetSummaryHistoryService } from "../get-summary-history.service";
import { CalculateCategorySummaryService } from "../calculate-category-summary.service";
import { CalculateTypeSummaryService } from "../calculate-type-summary.service";
import { CalculateRecurringVsVariableService } from "../calculate-recurring-vs-variable.service";
import { CalculateBalanceService } from "../calculate-balance.service";
import { CalculateSummaryTrendsService } from "../calculate-summary-trends.service";
import { CalculateCashflowForecastService } from "../calculate-cashflow-forecast.service";
import {
  TransactionStatus,
  TransactionType,
} from "@/app/api/domain/transaction/model/transaction.model";
import { getSeveralTransactionModels } from "@/app/api/domain/transaction/service/__tests__/fixtures/transaction.model.fixture";
import { getSeveralAccountModels } from "../../../account/service/__tests__/fixtures/account.model.fixture";
import { FrequencyGroup } from "@/app/api/domain/recurring-expense/model/recurring-expense.model";

describe("CalculateSummaryDashboardService", () => {
  let service: CalculateSummaryDashboardService;
  let filterTransactionsService: jest.Mocked<FilterTransactionsService>;
  let getAllAccountsService: jest.Mocked<GetAllAccountsService>;
  let getAllRecurringExpensesService: jest.Mocked<GetAllRecurringExpensesService>;
  let getSummaryHistoryService: jest.Mocked<GetSummaryHistoryService>;
  let calculateCategorySummaryService: jest.Mocked<CalculateCategorySummaryService>;
  let calculateTypeSummaryService: jest.Mocked<CalculateTypeSummaryService>;
  let calculateRecurringVsVariableService: jest.Mocked<CalculateRecurringVsVariableService>;
  let calculateBalanceService: jest.Mocked<CalculateBalanceService>;
  let calculateSummaryTrendsService: jest.Mocked<CalculateSummaryTrendsService>;
  let calculateCashflowForecastService: jest.Mocked<CalculateCashflowForecastService>;

  beforeEach(() => {
    const testContainer = container.createChildContainer();

    const mockFilterTransactionsService = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<FilterTransactionsService>;
    const mockGetAllAccountsService = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetAllAccountsService>;
    const mockGetAllRecurringExpensesService = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetAllRecurringExpensesService>;
    const mockGetSummaryHistoryService = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetSummaryHistoryService>;
    const mockCalculateCategorySummaryService = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<CalculateCategorySummaryService>;
    const mockCalculateTypeSummaryService = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<CalculateTypeSummaryService>;
    const mockCalculateRecurringVsVariableService = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<CalculateRecurringVsVariableService>;
    const mockCalculateBalanceService = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<CalculateBalanceService>;
    const mockCalculateSummaryTrendsService = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<CalculateSummaryTrendsService>;
    const mockCalculateCashflowForecastService = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<CalculateCashflowForecastService>;

    testContainer.register(FilterTransactionsService, {
      useValue: mockFilterTransactionsService,
    });
    testContainer.register(GetAllAccountsService, {
      useValue: mockGetAllAccountsService,
    });
    testContainer.register(GetAllRecurringExpensesService, {
      useValue: mockGetAllRecurringExpensesService,
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
    testContainer.register(CalculateRecurringVsVariableService, {
      useValue: mockCalculateRecurringVsVariableService,
    });
    testContainer.register(CalculateBalanceService, {
      useValue: mockCalculateBalanceService,
    });
    testContainer.register(CalculateSummaryTrendsService, {
      useValue: mockCalculateSummaryTrendsService,
    });
    testContainer.register(CalculateCashflowForecastService, {
      useValue: mockCalculateCashflowForecastService,
    });

    service = testContainer.resolve(CalculateSummaryDashboardService);
    filterTransactionsService = mockFilterTransactionsService;
    getAllAccountsService = mockGetAllAccountsService;
    getAllRecurringExpensesService = mockGetAllRecurringExpensesService;
    getSummaryHistoryService = mockGetSummaryHistoryService;
    calculateCategorySummaryService = mockCalculateCategorySummaryService;
    calculateTypeSummaryService = mockCalculateTypeSummaryService;
    calculateRecurringVsVariableService =
      mockCalculateRecurringVsVariableService;
    calculateBalanceService = mockCalculateBalanceService;
    calculateSummaryTrendsService = mockCalculateSummaryTrendsService;
    calculateCashflowForecastService = mockCalculateCashflowForecastService;
  });

  afterEach(() => {
    container.clearInstances();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should calculate summary successfully", async () => {
    const mockTransactions = getSeveralTransactionModels(1, [
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
    ]);
    const mockAccounts = getSeveralAccountModels(1, [
      {
        ref: "C1",
        balance: 1000,
      },
    ]);
    const mockHistory = [
      {
        id: "1",
        incomes: 500,
        expenses: 300,
        transfers: 0,
        createdAt: new Date("2026-05-15T00:00:00Z"),
      },
    ];
    const mockTrends = {
      balance: { current: 0, previous: 0, percentageChange: 0 },
      incomes: { current: 0, previous: 0, percentageChange: 0 },
      expenses: { current: -100, previous: 0, percentageChange: 0 },
    };
    const mockForecast = [
      {
        date: "2026-06",
        monthLabel: "Jun",
        incomes: 500,
        expenses: 300,
        transfers: 0,
        netFlow: 200,
        isForecast: true,
      },
    ];

    filterTransactionsService.execute.mockResolvedValue(mockTransactions);
    getAllAccountsService.execute.mockResolvedValue(mockAccounts);
    getAllRecurringExpensesService.execute.mockResolvedValue({
      recurringExpensesConfig: [],
      groupTotal: { [FrequencyGroup.MONTHLY]: 0, [FrequencyGroup.OTHERS]: 0 },
    });
    getSummaryHistoryService.execute.mockResolvedValue(mockHistory);
    calculateCategorySummaryService.execute.mockResolvedValue([
      { category: "Test Category", total: -100 },
    ]);
    calculateTypeSummaryService.execute.mockResolvedValue([
      { type: "expense", total: 100 },
    ]);
    calculateRecurringVsVariableService.execute.mockResolvedValue({
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
    calculateSummaryTrendsService.execute.mockResolvedValue(mockTrends);
    calculateCashflowForecastService.execute.mockResolvedValue(mockForecast);

    const result = await service.execute();

    const mappedTransactions = mockTransactions.map((t) => ({
      ...t,
      category: t.category ?? t.description,
    }));

    expect(result).toEqual({
      summary: {
        accountsBalance: mockAccounts,
        totalBalance: 1000,
        trends: mockTrends,
        cashflow: [
          {
            date: "2026-05",
            monthLabel: "May",
            incomes: 500,
            expenses: 300,
            transfers: 0,
            netFlow: 200,
          },
          ...mockForecast,
        ],
        byCategory: [{ category: "Test Category", total: -100 }],
        byType: [{ type: "expense", total: 100 }],
        recentTransactions: mappedTransactions,
        recurringVsVariable: {
          count: [
            { value: 1, type: "recurrent" },
            { value: 0, type: "variable" },
          ],
          total: [
            { value: 100, type: "recurrent" },
            { value: 0, type: "variable" },
          ],
        },
      },
      transactions: mappedTransactions,
    });
    expect(calculateCashflowForecastService.execute).toHaveBeenCalledWith(
      mockHistory,
      []
    );
  });
});
