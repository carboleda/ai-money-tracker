import { CategoryBudget } from "@/app/api/domain/category/model/category.model";

export interface CustomizeCategoryInput {
  ref: string; // ref of the predefined category being customized
  name?: string;
  icon?: string; // Emoji
  description?: string;
  color?: string; // Hex color
  budget?: CategoryBudget;
}
