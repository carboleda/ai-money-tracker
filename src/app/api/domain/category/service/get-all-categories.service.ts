import type { CategoryRepository } from "../repository/category.repository";
import { CategoryModel, PredefinedCategory } from "../model/category.model";
import { Service } from "@/app/api/domain/shared/ports/service.interface";
import {
  InjectRepository,
  Injectable,
} from "@/app/api/decorators/tsyringe.decorator";
import predefinedCategoriesJson from "@/config/predefined-categories.json";

@Injectable()
export class GetAllCategoriesService implements Service<void, CategoryModel[]> {
  private predefinedCategories: CategoryModel[] = [];

  constructor(
    @InjectRepository(CategoryModel)
    private readonly categoryRepository: CategoryRepository
  ) {
    this.loadPredefinedCategories();
  }

  private loadPredefinedCategories(): void {
    const categories = predefinedCategoriesJson as PredefinedCategory[];

    this.predefinedCategories = categories.map(
      (cat) =>
        new CategoryModel({
          id: null,
          ref: cat.ref,
          name: cat.name,
          icon: cat.icon,
          color: cat.color,
          restrictedTypes: cat.restrictedTypes,
          description: cat.description,
          isCustom: false,
          isDeleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
    );
  }

  async execute(): Promise<CategoryModel[]> {
    // Load custom categories from Firestore
    const customCategories = await this.categoryRepository.getAll();

    // Create a map of custom categories by ref
    const customMap = new Map(customCategories.map((c) => [c.ref, c]));

    // Merge: predefined categories first, then override with custom
    const mergedCategories: CategoryModel[] = [];

    // Add custom versions of predefined categories
    for (const predefined of this.predefinedCategories) {
      if (customMap.has(predefined.ref)) {
        mergedCategories.push(customMap.get(predefined.ref)!);
        customMap.delete(predefined.ref);
      } else {
        mergedCategories.push(predefined);
      }
    }

    // Add remaining custom categories that don't override predefined
    mergedCategories.push(...customMap.values());

    return mergedCategories;
  }
}
