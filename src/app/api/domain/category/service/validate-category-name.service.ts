import { Service } from "@/app/api/domain/shared/ports/service.interface";
import { Injectable } from "@/app/api/decorators/tsyringe.decorator";
import { DomainError } from "@/app/api/domain/shared/errors/domain.error";
import { GetAllCategoriesService } from "./get-all-categories.service";

interface ValidateCategoryNameParams {
  name: string;
  excludeRef?: string;
}

@Injectable()
export class ValidateCategoryNameService
  implements Service<ValidateCategoryNameParams, void>
{
  constructor(
    private readonly getAllCategoriesService: GetAllCategoriesService
  ) {}

  async execute(params: ValidateCategoryNameParams): Promise<void> {
    const { name, excludeRef } = params;
    const normalizedName = name.trim().toLowerCase();

    const categories = await this.getAllCategoriesService.execute();
    const isDuplicate = categories.some(
      (category) =>
        category.ref !== excludeRef &&
        category.name.trim().toLowerCase() === normalizedName
    );

    if (isDuplicate) {
      throw new DomainError(`Category '${name}' already exists`, 409);
    }
  }
}
