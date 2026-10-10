import "reflect-metadata";
import { container } from "tsyringe";
import { GetAllCategoriesWithBudgetStatusService } from "../get-all-categories-with-budget-status.service";
import { GetAllCategoriesService } from "../get-all-categories.service";
import { GetRecurringCommitmentByCategoryService } from "../get-recurring-commitment-by-category.service";
import { CategoryModel } from "@/app/api/domain/category/model/category.model";
import {
  TransactionModel,
  TransactionStatus,
  TransactionType,
} from "@/app/api/domain/transaction/model/transaction.model";
import type { TransactionRepository } from "@/app/api/domain/transaction/repository/transaction.repository";
import { getRepositoryToken } from "@/app/api/decorators/tsyringe.decorator";

describe("GetAllCategoriesWithBudgetStatusService", () => {
  let service: GetAllCategoriesWithBudgetStatusService;
  let getAllCategoriesService: GetAllCategoriesService;
  let getRecurringCommitmentByCategoryService: GetRecurringCommitmentByCategoryService;
  let transactionRepository: TransactionRepository;

  const buildCategory = (
    params: Partial<CategoryModel> & { ref: string },
  ): CategoryModel =>
    new CategoryModel({
      id: "id-" + params.ref,
      ref: params.ref,
      name: params.name ?? params.ref,
      icon: params.icon ?? "🏠",
      budget: params.budget,
      isCustom: params.isCustom ?? false,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

  const buildTransaction = (
    categoryRef: string,
    amount: number,
  ): TransactionModel =>
    new TransactionModel({
      id: "txn",
      description: "txn",
      type: TransactionType.EXPENSE,
      status: TransactionStatus.COMPLETE,
      category: categoryRef,
      sourceAccount: { ref: "acc" },
      amount,
      createdAt: new Date(),
    });

  beforeEach(() => {
    const testContainer = container.createChildContainer();

    const mockGetAllCategoriesService = {
      execute: jest.fn().mockResolvedValue([]),
    } as unknown as GetAllCategoriesService;

    const mockGetRecurringCommitmentByCategoryService = {
      execute: jest.fn().mockResolvedValue(new Map()),
    } as unknown as GetRecurringCommitmentByCategoryService;

    const mockTransactionRepository = {
      searchTransactions: jest.fn().mockResolvedValue([]),
    } as unknown as TransactionRepository;

    testContainer.register(GetAllCategoriesService, {
      useValue: mockGetAllCategoriesService,
    });
    testContainer.register(GetRecurringCommitmentByCategoryService, {
      useValue: mockGetRecurringCommitmentByCategoryService,
    });
    testContainer.register(getRepositoryToken(TransactionModel), {
      useValue: mockTransactionRepository,
    });

    service = testContainer.resolve(GetAllCategoriesWithBudgetStatusService);
    getAllCategoriesService = mockGetAllCategoriesService;
    getRecurringCommitmentByCategoryService =
      mockGetRecurringCommitmentByCategoryService;
    transactionRepository = mockTransactionRepository;
  });

  afterEach(() => {
    container.clearInstances();
  });

  it("includes committedFromRecurring on a category with a budget, under the limit", async () => {
    jest
      .spyOn(getAllCategoriesService, "execute")
      .mockResolvedValue([buildCategory({ ref: "HOME", budget: { limit: 1000 } })]);
    jest
      .spyOn(getRecurringCommitmentByCategoryService, "execute")
      .mockResolvedValue(new Map([["HOME", 300]]));
    jest
      .spyOn(transactionRepository, "searchTransactions")
      .mockResolvedValue([buildTransaction("HOME", 200)]);

    const [result] = await service.execute();

    expect(result.committedFromRecurring).toBe(300);
    expect(result.budget).toMatchObject({ limit: 1000, spent: 200 });
  });

  it("still returns the category, uncapped, when committed exceeds the manual limit", async () => {
    jest
      .spyOn(getAllCategoriesService, "execute")
      .mockResolvedValue([buildCategory({ ref: "HOME", budget: { limit: 500 } })]);
    jest
      .spyOn(getRecurringCommitmentByCategoryService, "execute")
      .mockResolvedValue(new Map([["HOME", 800]]));

    const [result] = await service.execute();

    expect(result.committedFromRecurring).toBe(800);
    expect(result.budget?.limit).toBe(500);
  });

  it("defaults committedFromRecurring to 0 and still returns the category when no budget is set", async () => {
    jest
      .spyOn(getAllCategoriesService, "execute")
      .mockResolvedValue([buildCategory({ ref: "HOME" })]);
    jest
      .spyOn(getRecurringCommitmentByCategoryService, "execute")
      .mockResolvedValue(new Map([["HOME", 150]]));

    const [result] = await service.execute();

    expect(result.committedFromRecurring).toBe(150);
    expect(result.budget).toBeUndefined();
  });

  it("defaults committedFromRecurring to 0 when the category has no recurring commitment", async () => {
    jest
      .spyOn(getAllCategoriesService, "execute")
      .mockResolvedValue([buildCategory({ ref: "HOME" })]);

    const [result] = await service.execute();

    expect(result.committedFromRecurring).toBe(0);
  });
});
