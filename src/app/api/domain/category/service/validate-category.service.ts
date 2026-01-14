import type { CategoryRepository } from "../repository/category.repository";
import { Service } from "@/app/api/domain/shared/ports/service.interface";
import {
  InjectRepository,
  Injectable,
} from "@/app/api/decorators/tsyringe.decorator";
import { DomainError } from "@/app/api/domain/shared/errors/domain.error";
import { CategoryModel } from "../model/category.model";
import { TransactionType } from "@/app/api/domain/transaction/model/transaction.model";
import { GetAllCategoriesService } from "./get-all-categories.service";

interface ValidateCategoryParams {
  categoryRef: string;
  transactionType: TransactionType;
}

@Injectable()
export class ValidateCategoryService
  implements Service<ValidateCategoryParams, void>
{
  constructor(
    @InjectRepository(CategoryModel)
    private readonly categoryRepository: CategoryRepository,
    private readonly getAllCategoriesService: GetAllCategoriesService
  ) {}

  async execute(params: ValidateCategoryParams): Promise<void> {
    const { categoryRef, transactionType } = params;

    try {
      // Get all categories (predefined + custom merged)
      const allCategories = await this.getAllCategoriesService.execute();

      // Find category by ref
      const category = allCategories.find((c) => c.ref === categoryRef);

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
