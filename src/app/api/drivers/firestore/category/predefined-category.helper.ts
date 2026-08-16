import predefinedCategoriesJson from "@/config/predefined-categories.json";
import { PredefinedCategory } from "@/app/api/domain/category/model/category.model";

export function loadPredefinedCategoryMap(): Map<string, PredefinedCategory> {
  const categories = predefinedCategoriesJson as PredefinedCategory[];
  return new Map(categories.map((cat) => [cat.ref, cat]));
}
