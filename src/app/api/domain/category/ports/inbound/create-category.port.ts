import {
  CategoryBudget,
  CategoryType,
} from "@/app/api/domain/category/model/category.model";

export interface CreateCategoryInput {
  name: string;
  icon: string; // Emoji
  restrictedTypes: CategoryType[]; // "income" | "expense" | "transfer"; empty = unrestricted
  description?: string;
  color?: string; // Hex color
  budget?: CategoryBudget;
}
