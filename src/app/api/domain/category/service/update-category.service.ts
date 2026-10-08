import type { CategoryRepository } from "../repository/category.repository";
import {
  CategoryModel,
  CategoryType,
  categoryAppliesToType,
} from "../model/category.model";
import { Service } from "@/app/api/domain/shared/ports/service.interface";
import {
  InjectRepository,
  Injectable,
} from "@/app/api/decorators/tsyringe.decorator";
import { UpdateCategoryInput } from "../ports/inbound/update-category.port";
import { DomainError } from "@/app/api/domain/shared/errors/domain.error";
import { ValidateCategoryNameService } from "./validate-category-name.service";

@Injectable()
export class UpdateCategoryService
  implements Service<UpdateCategoryInput, void>
{
  constructor(
    @InjectRepository(CategoryModel)
    private readonly categoryRepository: CategoryRepository,
    private readonly validateCategoryNameService: ValidateCategoryNameService
  ) {}

  async execute(input: UpdateCategoryInput): Promise<void> {
    try {
      const category = await this.categoryRepository.getCategoryById(input.id);

      if (!category) {
        throw new DomainError(`Category not found`, 404);
      }

      if (!category.isCustom) {
        throw new DomainError(`Cannot modify predefined category`, 400);
      }

      if (input.name !== undefined) {
        await this.validateCategoryNameService.execute({
          name: input.name,
          excludeRef: category.ref,
        });
      }

      // Validate budget constraints
      const restrictedTypes = input.restrictedTypes ?? category.restrictedTypes;
      if (
        input.budget != null &&
        !categoryAppliesToType(restrictedTypes, CategoryType.EXPENSE)
      ) {
        throw new DomainError(
          `Budget can only be applied to expense categories`,
          400
        );
      }

      await this.categoryRepository.update(input);
    } catch (error) {
      if (error instanceof DomainError) {
        throw error;
      }
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new DomainError(`Failed to update category: ${message}`, 500);
    }
  }
}
