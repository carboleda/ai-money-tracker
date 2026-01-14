import {
  CategoryType,
  CategoryModel,
} from "@/app/api/domain/category/model/category.model";

export const DEFAULT_ICON = "📌";

export const CATEGORY_TYPES: { label: string; key: CategoryType }[] = [
  { key: CategoryType.INCOME, label: "income" },
  { key: CategoryType.EXPENSE, label: "expense" },
  { key: CategoryType.TRANSFER, label: "transfer" },
];

export interface Category extends CategoryModel {
  id: string;
}

export interface GetCategoriesResponse {
  categories: Category[];
}
