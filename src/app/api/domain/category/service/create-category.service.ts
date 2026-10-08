import type { CategoryRepository } from "../repository/category.repository";
import { CategoryModel } from "../model/category.model";
import { Service } from "@/app/api/domain/shared/ports/service.interface";
import {
  InjectRepository,
  Injectable,
} from "@/app/api/decorators/tsyringe.decorator";
import { CreateCategoryInput } from "../ports/inbound/create-category.port";
import { DomainError } from "@/app/api/domain/shared/errors/domain.error";
import { ValidateCategoryNameService } from "./validate-category-name.service";

@Injectable()
export class CreateCategoryService
  implements Service<CreateCategoryInput, string>
{
  constructor(
    @InjectRepository(CategoryModel)
    private readonly categoryRepository: CategoryRepository,
    private readonly validateCategoryNameService: ValidateCategoryNameService
  ) {}

  async execute(input: CreateCategoryInput): Promise<string> {
    await this.validateCategoryNameService.execute({ name: input.name });

    try {
      return await this.categoryRepository.create(input);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      if (message.includes("already exists")) {
        throw new DomainError(`Failed to create category: ${message}`, 409);
      }
      throw new DomainError(`Failed to create category: ${message}`, 500);
    }
  }
}
