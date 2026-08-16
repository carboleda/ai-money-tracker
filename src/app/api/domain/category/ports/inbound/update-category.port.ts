import { CategoryBudget } from "@/app/api/domain/category/model/category.model";

export interface UpdateCategoryInput {
  id: string;
  name?: string;
  icon?: string;
  description?: string;
  color?: string;
  budget?: CategoryBudget;
}
