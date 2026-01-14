import {
  CategoryBudget,
  CategoryType,
} from "@/app/api/domain/category/model/category.model";

export interface CreateCategoryInput {
  name: string;
  icon: string; // Emoji
  type: CategoryType; // "income" | "expense" | "transfer"
  description?: string;
  color?: string; // Hex color
  budget?: CategoryBudget;
}
