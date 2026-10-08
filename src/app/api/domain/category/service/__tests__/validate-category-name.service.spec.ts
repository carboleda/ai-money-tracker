import "reflect-metadata";
import { container } from "tsyringe";
import { ValidateCategoryNameService } from "../validate-category-name.service";
import { CategoryRepository } from "@/app/api/domain/category/repository/category.repository";
import { CategoryModel } from "@/app/api/domain/category/model/category.model";
import { getRepositoryToken } from "@/app/api/decorators/tsyringe.decorator";
import { DomainError } from "@/app/api/domain/shared/errors/domain.error";

const buildCategory = (overrides: Partial<CategoryModel>): CategoryModel =>
  new CategoryModel({
    id: "id",
    ref: "custom-ref",
    name: "Custom",
    icon: "💰",
    isCustom: true,
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

describe("ValidateCategoryNameService", () => {
  let service: ValidateCategoryNameService;
  let categoryRepository: CategoryRepository;

  const setUp = (customCategories: CategoryModel[]) => {
    const testContainer = container.createChildContainer();

    const mockRepository = {
      getAll: jest.fn().mockResolvedValue(customCategories),
    } as unknown as CategoryRepository;

    testContainer.register(getRepositoryToken(CategoryModel), {
      useValue: mockRepository,
    });

    service = testContainer.resolve(ValidateCategoryNameService);
    categoryRepository = mockRepository;
  };

  afterEach(() => {
    container.clearInstances();
  });

  it("should be defined", () => {
    setUp([]);
    expect(service).toBeDefined();
  });

  it("allows a name that does not collide with any category", async () => {
    setUp([buildCategory({ ref: "other", name: "Other" })]);

    await expect(
      service.execute({ name: "Brand New" })
    ).resolves.toBeUndefined();
  });

  it("rejects a name that matches an existing custom category", async () => {
    setUp([buildCategory({ ref: "groceries-custom", name: "Groceries" })]);

    await expect(
      service.execute({ name: "Groceries" })
    ).rejects.toThrow(DomainError);
    await expect(
      service.execute({ name: "Groceries" })
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  it("rejects a name that matches a predefined category", async () => {
    setUp([]);

    await expect(service.execute({ name: "Groceries" })).rejects.toMatchObject(
      { statusCode: 409 }
    );
    expect(categoryRepository.getAll).toHaveBeenCalled();
  });

  it("is case-insensitive and ignores surrounding whitespace", async () => {
    setUp([buildCategory({ ref: "groceries-custom", name: "Groceries" })]);

    await expect(
      service.execute({ name: "  groceries  " })
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  it("excludes the category identified by excludeRef", async () => {
    setUp([buildCategory({ ref: "my-custom-ref", name: "My Custom Category" })]);

    await expect(
      service.execute({
        name: "My Custom Category",
        excludeRef: "my-custom-ref",
      })
    ).resolves.toBeUndefined();
  });
});
