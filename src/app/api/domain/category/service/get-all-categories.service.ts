import type { CategoryRepository } from "../repository/category.repository";
import { CategoryModel, CategoryType } from "../model/category.model";
import { Service } from "@/app/api/domain/shared/ports/service.interface";
import {
  InjectRepository,
  Injectable,
} from "@/app/api/decorators/tsyringe.decorator";
import * as fs from "node:fs";
import * as path from "node:path";

interface PredefinedCategory {
  ref: string;
  name: string;
  icon: string;
  color: string;
  type: CategoryType;
  description: string;
}

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
    try {
      const filePath = path.join(
        process.cwd(),
        "src/config/predefined-categories.json"
      );
      const jsonData = fs.readFileSync(filePath, "utf-8");
      const categories: PredefinedCategory[] = JSON.parse(jsonData);

      this.predefinedCategories = categories.map(
        (cat, index) =>
          new CategoryModel({
            id: null,
            ref: cat.ref,
            name: cat.name,
            icon: cat.icon,
            color: cat.color,
            type: cat.type,
            description: cat.description,
            isCustom: false,
            isDeleted: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
      );
    } catch (error) {
      console.error("Failed to load predefined categories:", error);
      this.predefinedCategories = [];
    }
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
