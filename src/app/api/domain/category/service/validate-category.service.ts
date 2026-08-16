import { Service } from "@/app/api/domain/shared/ports/service.interface";
import { Injectable } from "@/app/api/decorators/tsyringe.decorator";
import { DomainError } from "@/app/api/domain/shared/errors/domain.error";
import { TransactionType } from "@/app/api/domain/transaction/model/transaction.model";
import { CategoryModel } from "../model/category.model";

interface ValidateCategoryParams {
  categories: CategoryModel[];
  categoryRef: string;
  transactionType: TransactionType;
}

@Injectable()
export class ValidateCategoryService
  implements Service<ValidateCategoryParams, void>
{
  constructor() {}

  async execute(params: ValidateCategoryParams): Promise<void> {
    const { categories, categoryRef, transactionType } = params;

    try {
      // Find category by ref
      const category = categories.find((c) => c.ref === categoryRef);

      if (!category || category.isDeleted) {
        throw new DomainError(
          `Category '${categoryRef}' does not exist, is deleted, or is not valid for transaction type`,
          400
        );
      }

      // Validate category type matches transaction type
      // Both CategoryType and TransactionType use the same string values
      const categoryTypeStr = category.type as string;
      const transactionTypeStr = transactionType as string;

      if (categoryTypeStr !== transactionTypeStr) {
        throw new DomainError(
          `Category '${categoryRef}' does not exist, is deleted, or is not valid for transaction type`,
          400
        );
      }
    } catch (error) {
      if (error instanceof DomainError) {
        throw error;
      }
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new DomainError(`Failed to validate category: ${message}`, 500);
    }
  }
}
