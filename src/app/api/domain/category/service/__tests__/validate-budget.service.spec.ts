import "reflect-metadata";
import { container } from "tsyringe";
import { ValidateBudgetService } from "../validate-budget.service";
import { CategoryType } from "../../model/category.model";
import { DomainError } from "@/app/api/domain/shared/errors/domain.error";

describe("ValidateBudgetService", () => {
  let service: ValidateBudgetService;

  beforeEach(() => {
    const testContainer = container.createChildContainer();
    service = testContainer.resolve(ValidateBudgetService);
  });

  afterEach(() => {
    container.clearInstances();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("does nothing when no budget is provided", async () => {
    await expect(
      service.execute({ restrictedTypes: [CategoryType.INCOME] })
    ).resolves.toBeUndefined();
  });

  it("allows a budget when restrictedTypes is empty (unrestricted)", async () => {
    await expect(
      service.execute({ budget: { limit: 100 }, restrictedTypes: [] })
    ).resolves.toBeUndefined();
  });

  it("allows a budget when restrictedTypes includes expense", async () => {
    await expect(
      service.execute({
        budget: { limit: 100 },
        restrictedTypes: [CategoryType.EXPENSE, CategoryType.INCOME],
      })
    ).resolves.toBeUndefined();
  });

  it("rejects a budget when restrictedTypes excludes expense", async () => {
    await expect(
      service.execute({
        budget: { limit: 100 },
        restrictedTypes: [CategoryType.INCOME],
      })
    ).rejects.toThrow(DomainError);
  });

  it("skips the type check entirely when restrictedTypes is undefined", async () => {
    await expect(
      service.execute({ budget: { limit: 100 } })
    ).resolves.toBeUndefined();
  });

  it("rejects a non-positive budget limit", async () => {
    await expect(
      service.execute({
        budget: { limit: 0 },
        restrictedTypes: [CategoryType.EXPENSE],
      })
    ).rejects.toThrow(DomainError);
  });

  it("rejects an out-of-range alert threshold", async () => {
    await expect(
      service.execute({
        budget: { limit: 100, alertThreshold: 150 },
        restrictedTypes: [CategoryType.EXPENSE],
      })
    ).rejects.toThrow(DomainError);
  });
});
