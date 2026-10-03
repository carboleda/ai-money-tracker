import "reflect-metadata";
import { container } from "tsyringe";
import { CustomizeCategoryService } from "../customize-category.service";
import { CategoryRepository } from "@/app/api/domain/category/repository/category.repository";
import { CategoryModel } from "@/app/api/domain/category/model/category.model";
import { getRepositoryToken } from "@/app/api/decorators/tsyringe.decorator";
import { ValidateBudgetService } from "../validate-budget.service";
import { DomainError } from "@/app/api/domain/shared/errors/domain.error";
import type { CustomizeCategoryInput } from "@/app/api/domain/category/ports/inbound/customize-category.port";

describe("CustomizeCategoryService", () => {
  let service: CustomizeCategoryService;
  let categoryRepository: CategoryRepository;
  let validateBudgetService: ValidateBudgetService;

  beforeEach(() => {
    const testContainer = container.createChildContainer();

    const mockRepository = {
      createCustomFromPredefined: jest.fn().mockResolvedValue("new-id"),
    } as unknown as CategoryRepository;

    const mockValidateBudgetService = {
      execute: jest.fn().mockResolvedValue(undefined),
    } as unknown as ValidateBudgetService;

    testContainer.register(getRepositoryToken(CategoryModel), {
      useValue: mockRepository,
    });
    testContainer.register(ValidateBudgetService, {
      useValue: mockValidateBudgetService,
    });

    service = testContainer.resolve(CustomizeCategoryService);
    categoryRepository = mockRepository;
    validateBudgetService = mockValidateBudgetService;
  });

  afterEach(() => {
    container.clearInstances();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("rejects when ref does not match a predefined category", async () => {
    const input: CustomizeCategoryInput = { ref: "NOT_PREDEFINED" };

    await expect(service.execute(input)).rejects.toThrow(DomainError);
    await expect(service.execute(input)).rejects.toMatchObject({
      statusCode: 404,
    });
    expect(categoryRepository.createCustomFromPredefined).not.toHaveBeenCalled();
  });

  it("validates budget against the predefined category's restrictedTypes", async () => {
    const input: CustomizeCategoryInput = {
      ref: "GROCERIES",
      budget: { limit: 100 },
    };

    await service.execute(input);

    expect(validateBudgetService.execute).toHaveBeenCalledWith({
      budget: { limit: 100 },
      restrictedTypes: ["expense"],
    });
  });

  it("propagates the DomainError thrown by budget validation", async () => {
    jest
      .spyOn(validateBudgetService, "execute")
      .mockRejectedValue(
        new DomainError("Budget can only be applied to expense categories", 400)
      );

    const input: CustomizeCategoryInput = {
      ref: "SALARY",
      budget: { limit: 100 },
    };

    await expect(service.execute(input)).rejects.toMatchObject({
      statusCode: 400,
    });
    expect(categoryRepository.createCustomFromPredefined).not.toHaveBeenCalled();
  });

  it("defaults name/icon/color/description/restrictedTypes from the predefined category", async () => {
    const input: CustomizeCategoryInput = { ref: "GROCERIES" };

    await service.execute(input);

    expect(categoryRepository.createCustomFromPredefined).toHaveBeenCalledWith(
      "GROCERIES",
      {
        name: "Groceries",
        icon: "🛒",
        color: "#10B981",
        description: "Grocery shopping and food items",
        restrictedTypes: ["expense"],
        budget: undefined,
      }
    );
  });

  it("overrides only the fields explicitly supplied by the client", async () => {
    const input: CustomizeCategoryInput = {
      ref: "GROCERIES",
      name: "Weekly Groceries",
      color: "#000000",
      budget: { limit: 500, alertThreshold: 80 },
    };

    await service.execute(input);

    expect(categoryRepository.createCustomFromPredefined).toHaveBeenCalledWith(
      "GROCERIES",
      {
        name: "Weekly Groceries",
        icon: "🛒",
        color: "#000000",
        description: "Grocery shopping and food items",
        restrictedTypes: ["expense"],
        budget: { limit: 500, alertThreshold: 80 },
      }
    );
  });

  it("returns the id created by the repository", async () => {
    const result = await service.execute({ ref: "GROCERIES" });

    expect(result).toBe("new-id");
  });

  it("maps a duplicate-ref repository error to a 409 DomainError", async () => {
    jest
      .spyOn(categoryRepository, "createCustomFromPredefined")
      .mockRejectedValue(new Error("Category reference 'GROCERIES' already exists"));

    await expect(service.execute({ ref: "GROCERIES" })).rejects.toMatchObject({
      statusCode: 409,
    });
  });

  it("maps an unexpected repository error to a 500 DomainError", async () => {
    jest
      .spyOn(categoryRepository, "createCustomFromPredefined")
      .mockRejectedValue(new Error("boom"));

    await expect(service.execute({ ref: "GROCERIES" })).rejects.toMatchObject({
      statusCode: 500,
    });
  });
});
