import "reflect-metadata";
import { container } from "tsyringe";
import { ValidateCategoryService } from "../validate-category.service";
import { CategoryModel, CategoryType } from "../../model/category.model";
import { TransactionType } from "@/app/api/domain/transaction/model/transaction.model";
import { DomainError } from "@/app/api/domain/shared/errors/domain.error";

describe("ValidateCategoryService", () => {
  let service: ValidateCategoryService;

  const buildCategory = (
    overrides: Partial<{
      ref: string;
      restrictedTypes: CategoryType[];
      isDeleted: boolean;
    }> = {},
  ): CategoryModel =>
    new CategoryModel({
      id: "1",
      ref: overrides.ref ?? "GROCERIES",
      name: "Groceries",
      icon: "🛒",
      restrictedTypes: overrides.restrictedTypes,
      isCustom: false,
      isDeleted: overrides.isDeleted ?? false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

  beforeEach(() => {
    const testContainer = container.createChildContainer();
    service = testContainer.resolve(ValidateCategoryService);
  });

  afterEach(() => {
    container.clearInstances();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("allows an unrestricted category for any transaction type", async () => {
    const categories = [buildCategory({ restrictedTypes: [] })];

    await expect(
      service.execute({
        categories,
        categoryRef: "GROCERIES",
        transactionType: TransactionType.INCOME,
      }),
    ).resolves.toBeUndefined();
  });

  it("allows a single-restriction category when the transaction type matches", async () => {
    const categories = [
      buildCategory({ restrictedTypes: [CategoryType.EXPENSE] }),
    ];

    await expect(
      service.execute({
        categories,
        categoryRef: "GROCERIES",
        transactionType: TransactionType.EXPENSE,
      }),
    ).resolves.toBeUndefined();
  });

  it("rejects a single-restriction category when the transaction type does not match", async () => {
    const categories = [
      buildCategory({ restrictedTypes: [CategoryType.EXPENSE] }),
    ];

    await expect(
      service.execute({
        categories,
        categoryRef: "GROCERIES",
        transactionType: TransactionType.INCOME,
      }),
    ).rejects.toThrow(DomainError);
  });

  it("allows a multi-restriction category for any of its listed types", async () => {
    const categories = [
      buildCategory({
        ref: "INVESTMENT",
        restrictedTypes: [],
      }),
    ];

    await expect(
      service.execute({
        categories,
        categoryRef: "INVESTMENT",
        transactionType: TransactionType.INCOME,
      }),
    ).resolves.toBeUndefined();
  });

  it("rejects a multi-restriction category for a type not in the list", async () => {
    const categories = [
      buildCategory({
        ref: "GIFTS",
        restrictedTypes: [CategoryType.EXPENSE, CategoryType.INCOME],
      }),
    ];

    await expect(
      service.execute({
        categories,
        categoryRef: "GIFTS",
        transactionType: TransactionType.TRANSFER,
      }),
    ).rejects.toThrow(DomainError);
  });

  it("rejects when the category does not exist", async () => {
    await expect(
      service.execute({
        categories: [],
        categoryRef: "MISSING",
        transactionType: TransactionType.EXPENSE,
      }),
    ).rejects.toThrow(DomainError);
  });

  it("rejects when the category is soft-deleted", async () => {
    const categories = [buildCategory({ isDeleted: true })];

    await expect(
      service.execute({
        categories,
        categoryRef: "GROCERIES",
        transactionType: TransactionType.EXPENSE,
      }),
    ).rejects.toThrow(DomainError);
  });
});
