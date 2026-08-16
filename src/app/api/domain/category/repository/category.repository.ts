import { CategoryModel } from "../model/category.model";
import { CreateCategoryInput } from "../ports/inbound/create-category.port";
import { UpdateCategoryInput } from "../ports/inbound/update-category.port";

export interface CategoryRepository {
  getAll(): Promise<CategoryModel[]>;

  getCategoryById(id: string): Promise<CategoryModel | null>;

  getCategoryByRef(ref: string): Promise<CategoryModel | null>;

  create(data: CreateCategoryInput): Promise<string>;

  update(data: UpdateCategoryInput): Promise<void>;

  delete(id: string): Promise<void>;
}
