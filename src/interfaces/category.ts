import { CategoryOutput } from "@/app/api/domain/category/ports/outbound/get-categories.port";

export interface GetCategoriesResponse {
  categories: CategoryOutput[];
}
