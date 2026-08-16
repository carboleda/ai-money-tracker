import type { CategoryRepository } from "../repository/category.repository";
import { Service } from "@/app/api/domain/shared/ports/service.interface";
import {
  InjectRepository,
  Injectable,
} from "@/app/api/decorators/tsyringe.decorator";
import { DomainError } from "@/app/api/domain/shared/errors/domain.error";
import { CategoryModel } from "../model/category.model";

@Injectable()
export class DeleteCategoryService implements Service<string, void> {
  constructor(
    @InjectRepository(CategoryModel)
    private readonly categoryRepository: CategoryRepository
  ) {}

  async execute(id: string): Promise<void> {
    try {
      const category = await this.categoryRepository.getCategoryById(id);

      if (!category) {
        throw new DomainError(`Category not found`, 404);
      }

      if (!category.isCustom) {
        throw new DomainError(`Cannot delete predefined category`, 400);
      }

      await this.categoryRepository.delete(id);
    } catch (error) {
      if (error instanceof DomainError) {
        throw error;
      }
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new DomainError(`Failed to delete category: ${message}`, 500);
    }
  }
}
