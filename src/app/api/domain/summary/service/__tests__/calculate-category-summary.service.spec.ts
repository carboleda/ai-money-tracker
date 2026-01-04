import "reflect-metadata";
import { container } from "tsyringe";
import { CalculateCategorySummaryService } from "../calculate-category-summary.service";
import {
  TransactionModel,
  TransactionStatus,
  TransactionType,
} from "@/app/api/domain/transaction/model/transaction.model";
import { getSeveralTransactionModels } from "@/app/api/domain/transaction/service/__tests__/fixtures/transaction.model.fixture";

describe("CalculateCategorySummaryService", () => {
  let service: CalculateCategorySummaryService;

  beforeEach(() => {
    const testContainer = container.createChildContainer();
    service = testContainer.resolve(CalculateCategorySummaryService);
  });

  afterEach(() => {
    container.clearInstances();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should calculate category summary correctly", async () => {
    const mockTransactions: TransactionModel[] = getSeveralTransactionModels(
      3,
      [
        {
          id: "1",
          type: TransactionType.INCOME,
          status: TransactionStatus.COMPLETE,
          category: "Salary",
          sourceAccount: "C1",
          amount: 1000,
        },
        {
          id: "2",
          type: TransactionType.EXPENSE,
          status: TransactionStatus.COMPLETE,
          category: "Investments",
          sourceAccount: "C1",
          amount: 200,
        },
        {
          id: "3",
          type: TransactionType.INCOME,
          status: TransactionStatus.COMPLETE,
          category: "Investments",
          sourceAccount: "C1",
          amount: 50,
        },
      ]
    );

    const result = await service.execute(mockTransactions);

    expect(result).toEqual([
      { category: "Salary", total: 1000 },
      { category: "Investments", total: -150 },
    ]);
  });

  it("should handle transactions without category", async () => {
    const mockTransactions: TransactionModel[] = getSeveralTransactionModels(
      1,
      [
        {
          id: "1",
          description: "Unknown transaction",
          type: TransactionType.EXPENSE,
          status: TransactionStatus.COMPLETE,
          sourceAccount: "C1",
          category: undefined,
          amount: 100,
        },
      ]
    );

    const result = await service.execute(mockTransactions);

    expect(result).toEqual([{ category: "undefined", total: -100 }]);
  });

  it("should return empty array for empty transactions", async () => {
    const result = await service.execute([]);

    expect(result).toEqual([]);
  });
});
