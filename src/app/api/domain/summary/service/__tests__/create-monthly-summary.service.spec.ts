import "reflect-metadata";
import { container } from "tsyringe";
import { CreateMonthlySummaryService } from "../create-monthly-summary.service";
import { SummaryHistoryRepository } from "../../repository/summary-history.repository";
import { FilterTransactionsService } from "../../../transaction/service/filter-transactions.service";
import { getRepositoryToken } from "@/app/api/decorators/tsyringe.decorator";
import { SummaryHistoryModel } from "../../model/summary-history.model";
import { transactionModelFixture } from "@/app/api/drivers/firestore/transaction/__tests__/fixtures/transaction.fixture";

describe("CreateMonthlySummaryService", () => {
  let service: CreateMonthlySummaryService;
  let mockRepository: jest.Mocked<SummaryHistoryRepository>;
  let mockFilterService: jest.Mocked<FilterTransactionsService>;

  beforeEach(() => {
    const testContainer = container.createChildContainer();

    mockRepository = {
      create: jest.fn(),
      getHistorySince: jest.fn(),
    } as unknown as jest.Mocked<SummaryHistoryRepository>;

    mockFilterService = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<FilterTransactionsService>;

    testContainer.register(getRepositoryToken(SummaryHistoryModel), {
      useValue: mockRepository,
    });
    testContainer.register(FilterTransactionsService, {
      useValue: mockFilterService,
    });

    service = testContainer.resolve(CreateMonthlySummaryService);
  });

  afterEach(() => {
    container.clearInstances();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should skip execution if not the 2nd of the month", async () => {
    // Mock date to not be the 2nd
    jest.spyOn(Date.prototype, "getDate").mockReturnValue(1);

    await service.execute();

    expect(mockFilterService.execute).not.toHaveBeenCalled();
    expect(mockRepository.create).not.toHaveBeenCalled();
  });

  it("should create a monthly summary", async () => {
    jest.spyOn(Date.prototype, "getDate").mockReturnValue(2);
    mockFilterService.execute.mockResolvedValue([transactionModelFixture]);

    await service.execute();

    expect(mockFilterService.execute).toHaveBeenCalled();
    expect(mockRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        incomes: 0,
        expenses: 100.5,
        transfers: 0,
        createdAt: expect.any(Date),
      })
    );
  });
});
