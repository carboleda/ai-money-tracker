import "reflect-metadata";
import { container } from "tsyringe";
import { CreateMonthlySummaryService } from "../create-monthly-summary.service";
import { SummaryHistoryRepository } from "../../repository/summary-history.repository";
import { FilterTransactionsService } from "../../../transaction/service/filter-transactions.service";
import { getRepositoryToken } from "@/app/api/decorators/tsyringe.decorator";
import { SummaryHistoryModel } from "../../model/summary-history.model";
import { transactionModelFixture } from "@/app/api/domain/transaction/service/__tests__/fixtures/transaction.model.fixture";
import { GetUserService } from "@/app/api/domain/user/service/get-user.service";
import { createUserModelFixture } from "@/app/api/domain/user/service/__tests__/fixtures/user.model.fixture";

jest.mock("@/config/env", () => ({
  Env: { RUN_ON_DAY_OF_MONTH: 15 },
}));

const mockRunOnDayOfMonth = 15;

describe("CreateMonthlySummaryService", () => {
  let service: CreateMonthlySummaryService;
  let mockRepository: jest.Mocked<SummaryHistoryRepository>;
  let mockFilterService: jest.Mocked<FilterTransactionsService>;
  let mockGetUserService: jest.Mocked<GetUserService>;

  beforeEach(() => {
    const testContainer = container.createChildContainer();

    mockRepository = {
      create: jest.fn(),
      getHistorySince: jest.fn(),
    } as unknown as jest.Mocked<SummaryHistoryRepository>;

    mockFilterService = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<FilterTransactionsService>;

    mockGetUserService = {
      execute: jest.fn().mockResolvedValue(createUserModelFixture()),
    } as unknown as jest.Mocked<GetUserService>;

    testContainer.register(getRepositoryToken(SummaryHistoryModel), {
      useValue: mockRepository,
    });
    testContainer.register(FilterTransactionsService, {
      useValue: mockFilterService,
    });
    testContainer.register(GetUserService, {
      useValue: mockGetUserService,
    });

    service = testContainer.resolve(CreateMonthlySummaryService);
  });

  afterEach(() => {
    container.clearInstances();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should skip execution if not the configured day of the month", async () => {
    // Mock date to not match the configured run day
    jest
      .spyOn(Date.prototype, "getDate")
      .mockReturnValue(mockRunOnDayOfMonth + 1);

    await service.execute();

    expect(mockFilterService.execute).not.toHaveBeenCalled();
    expect(mockRepository.create).not.toHaveBeenCalled();
  });

  it("should create a monthly summary", async () => {
    jest
      .spyOn(Date.prototype, "getDate")
      .mockReturnValue(mockRunOnDayOfMonth);
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

  it("should use the user's monthlyReportDay setting over the env default", async () => {
    const customDay = 20;
    mockGetUserService.execute.mockResolvedValue(
      createUserModelFixture({ settings: { monthlyReportDay: customDay } })
    );
    jest.spyOn(Date.prototype, "getDate").mockReturnValue(customDay);
    mockFilterService.execute.mockResolvedValue([transactionModelFixture]);

    await service.execute();

    expect(mockFilterService.execute).toHaveBeenCalled();
    expect(mockRepository.create).toHaveBeenCalled();
  });

  it("should skip execution when the current day doesn't match the user's monthlyReportDay setting", async () => {
    mockGetUserService.execute.mockResolvedValue(
      createUserModelFixture({ settings: { monthlyReportDay: 20 } })
    );
    jest.spyOn(Date.prototype, "getDate").mockReturnValue(mockRunOnDayOfMonth);

    await service.execute();

    expect(mockFilterService.execute).not.toHaveBeenCalled();
    expect(mockRepository.create).not.toHaveBeenCalled();
  });
});
