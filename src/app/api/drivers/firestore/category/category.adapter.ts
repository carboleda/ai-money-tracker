import { CategoryModel } from "@/app/api/domain/category/model/category.model";
import { CategoryEntity } from "./category.entity";
import { Timestamp } from "firebase-admin/firestore";

export class CategoryAdapter {
  static toModel(entity: CategoryEntity, id: string): CategoryModel {
    return new CategoryModel({
      id,
      ref: entity.ref,
      name: entity.name,
      icon: entity.icon,
      color: entity.color,
      type: entity.type,
      description: entity.description,
      budget: entity.budget,
      isCustom: entity.isCustom ?? true,
      isDeleted: entity.isDeleted ?? false,
      createdAt: entity.createdAt.toDate(),
      updatedAt: entity.updatedAt.toDate(),
    });
  }

  static toEntity(model: CategoryModel): CategoryEntity {
    return {
      ref: model.ref,
      name: model.name,
      icon: model.icon,
      color: model.color,
      type: model.type,
      description: model.description,
      budget: model.budget,
      isCustom: model.isCustom ?? true,
      isDeleted: model.isDeleted ?? false,
      createdAt: Timestamp.fromDate(model.createdAt),
      updatedAt: Timestamp.fromDate(model.updatedAt),
    };
  }
}
