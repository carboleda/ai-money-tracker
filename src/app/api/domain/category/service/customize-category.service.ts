import type { CategoryRepository } from "../repository/category.repository";
import { CategoryModel, PredefinedCategory } from "../model/category.model";
import { Service } from "@/app/api/domain/shared/ports/service.interface";
import {
  InjectRepository,
  Injectable,
} from "@/app/api/decorators/tsyringe.decorator";
import { CustomizeCategoryInput } from "../ports/inbound/customize-category.port";
import { CreateCategoryInput } from "../ports/inbound/create-category.port";
import { DomainError } from "@/app/api/domain/shared/errors/domain.error";
import { ValidateBudgetService } from "./validate-budget.service";
import predefinedCategoriesJson from "@/config/predefined-categories.json";

@Injectable()
export class CustomizeCategoryService
  implements Service<CustomizeCategoryInput, string>
{
  private readonly predefinedCategories: PredefinedCategory[] =
    predefinedCategoriesJson as PredefinedCategory[];

  constructor(
    @InjectRepository(CategoryModel)
    private readonly categoryRepository: CategoryRepository,
    private readonly validateBudgetService: ValidateBudgetService
  ) {}

  async execute(input: CustomizeCategoryInput): Promise<string> {
    const predefined = this.predefinedCategories.find(
      (cat) => cat.ref === input.ref
    );

    if (!predefined) {
      throw new DomainError(
        `Predefined category '${input.ref}' not found`,
        404
      );
    }

    const restrictedTypes = input.restrictedTypes ?? predefined.restrictedTypes;

    await this.validateBudgetService.execute({
      budget: input.budget,
      restrictedTypes,
    });

    const data: CreateCategoryInput = {
      name: input.name ?? predefined.name,
      icon: input.icon ?? predefined.icon,
      color: input.color ?? predefined.color,
      description: input.description ?? predefined.description,
      restrictedTypes,
      budget: input.budget,
    };

    try {
      return await this.categoryRepository.createCustomFromPredefined(
        input.ref,
        data
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      if (message.includes("already exists")) {
        throw new DomainError(
          `Category '${input.ref}' has already been customized`,
          409
        );
      }
      throw new DomainError(`Failed to customize category: ${message}`, 500);
    }
  }
}
