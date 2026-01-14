import {
  CategoryType,
  CategoryBudget,
  BudgetStatus,
} from "@/app/api/domain/category/model/category.model";

export interface CategoryOutput {
  id: string;
  ref: string;
  name: string;
  icon: string;
  color?: string;
  type: CategoryType;
  description?: string;
  budget?: CategoryBudget;
  isCustom: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryWithBudgetStatusOutput
  extends Omit<CategoryOutput, "budget"> {
  budget?: BudgetStatus;
}
