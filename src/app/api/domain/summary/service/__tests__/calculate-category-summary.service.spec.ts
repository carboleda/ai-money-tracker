import "reflect-metadata";
import { container } from "tsyringe";
import { CalculateCategorySummaryService } from "../calculate-category-summary.service";
import {
  TransactionModel,
  TransactionStatus,
  TransactionType,
} from "../../../transaction/model/transaction.model";

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
    const mockTransactions: TransactionModel[] = [
      new TransactionModel({
        id: "1",
        description: "Salary",
        type: TransactionType.INCOME,
        status: TransactionStatus.COMPLETE,
        category: "Salary",
        sourceAccount: "C1",
        amount: 1000,
        createdAt: new Date(),
      }),
      new TransactionModel({
        id: "2",
        description: "Groceries",
        type: TransactionType.EXPENSE,
        status: TransactionStatus.COMPLETE,
        category: "Groceries",
        sourceAccount: "C1",
        amount: 100,
        createdAt: new Date(),
      }),
      new TransactionModel({
        id: "3",
        description: "More groceries",
        type: TransactionType.EXPENSE,
        status: TransactionStatus.COMPLETE,
        category: "Groceries",
        sourceAccount: "C1",
        amount: 50,
        createdAt: new Date(),
      }),
    ];

    const result = await service.execute(mockTransactions);

    expect(result).toEqual([
      { category: "Salary", total: 1000 },
      { category: "Groceries", total: 150 },
    ]);
  });

  it("should handle transactions without category", async () => {
    const mockTransactions: TransactionModel[] = [
      new TransactionModel({
        id: "1",
        description: "Unknown transaction",
        type: TransactionType.EXPENSE,
        status: TransactionStatus.COMPLETE,
        sourceAccount: "C1",
        amount: 100,
        createdAt: new Date(),
      }),
    ];

    const result = await service.execute(mockTransactions);

    expect(result).toEqual([{ category: "undefined", total: 100 }]);
  });

  it("should return empty array for empty transactions", async () => {
    const result = await service.execute([]);

    expect(result).toEqual([]);
  });
});
