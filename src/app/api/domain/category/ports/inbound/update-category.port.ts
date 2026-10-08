import {
  CategoryBudget,
  CategoryType,
} from "@/app/api/domain/category/model/category.model";

export interface UpdateCategoryInput {
  id: string;
  name?: string;
  icon?: string;
  restrictedTypes?: CategoryType[];
  description?: string;
  color?: string;
  budget?: CategoryBudget | null;
}
