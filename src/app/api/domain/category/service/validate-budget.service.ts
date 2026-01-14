import { Service } from "@/app/api/domain/shared/ports/service.interface";
import { Injectable } from "@/app/api/decorators/tsyringe.decorator";
import { DomainError } from "@/app/api/domain/shared/errors/domain.error";
import { CategoryBudget, CategoryType } from "../model/category.model";

interface ValidateBudgetParams {
  budget?: CategoryBudget;
  categoryType?: CategoryType;
}

@Injectable()
export class ValidateBudgetService
  implements Service<ValidateBudgetParams, void>
{
  async execute(params: ValidateBudgetParams): Promise<void> {
    const { budget, categoryType } = params;

    if (!budget) {
      return; // Budget is optional
    }

    // Budget only applies to expense categories
    if (categoryType && categoryType !== "expense") {
      throw new DomainError(
        `Budget can only be applied to expense categories`,
        400
      );
    }

    // Validate budget limit is positive
    if (budget.limit <= 0) {
      throw new DomainError(`Budget limit must be a positive number`, 400);
    }

    // Validate alert threshold if provided
    if (budget.alertThreshold !== undefined) {
      if (budget.alertThreshold < 0 || budget.alertThreshold > 100) {
        throw new DomainError(`Alert threshold must be between 0 and 100`, 400);
      }
    }
  }
}
