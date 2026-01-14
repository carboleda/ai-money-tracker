import {
  Injectable,
  Inject,
  InjectUserContext,
} from "@/app/api/decorators/tsyringe.decorator";
import { CategoryModel } from "@/app/api/domain/category/model/category.model";
import { CategoryRepository } from "@/app/api/domain/category/repository/category.repository";
import { CategoryAdapter } from "./category.adapter";
import { Firestore, Timestamp } from "firebase-admin/firestore";
import { Collections } from "../types";
import { CategoryEntity } from "./category.entity";
import { BaseFirestoreRepository } from "@/app/api/drivers/firestore/base/base.firestore.repository";
import type { UserContext } from "@/app/api/context/user-context";
import { CreateCategoryInput } from "@/app/api/domain/category/ports/inbound/create-category.port";
import { UpdateCategoryInput } from "@/app/api/domain/category/ports/inbound/update-category.port";
import { nanoid } from "nanoid";

@Injectable()
export class CategoryFirestoreRepository
  extends BaseFirestoreRepository
  implements CategoryRepository
{
  constructor(
    @Inject(Firestore) firestore: Firestore,
    @InjectUserContext() userContext: UserContext
  ) {
    super(Collections.Categories, firestore, userContext);
  }

  async getAll(): Promise<CategoryModel[]> {
    const snapshot = await this.getUserCollectionReference()
      .where("isDeleted", "==", false)
      .get();

    const categories = snapshot.docs.map((doc) => {
      const entity = { ...doc.data() } as CategoryEntity;
      return CategoryAdapter.toModel(entity, doc.id);
    });

    return categories;
  }

  async getCategoryById(id: string): Promise<CategoryModel | null> {
    const doc = await this.getUserCollectionReference().doc(id).get();

    if (!doc.exists) {
      return null;
    }

    const entity = { ...doc.data() } as CategoryEntity;
    return CategoryAdapter.toModel(entity, doc.id);
  }

  async getCategoryByRef(ref: string): Promise<CategoryModel | null> {
    const snapshot = await this.getUserCollectionReference()
      .where("ref", "==", ref)
      .where("isDeleted", "==", false)
      .limit(1)
      .get();

    if (snapshot.size === 0) {
      return null;
    }

    const doc = snapshot.docs[0];
    const entity = { ...doc.data() } as CategoryEntity;
    return CategoryAdapter.toModel(entity, doc.id);
  }

  async create(data: CreateCategoryInput): Promise<string> {
    // Generate ref if not provided
    const ref = nanoid(12);

    // Check if ref already exists for this user (custom categories only)
    const existingCategory = await this.getCategoryByRef(ref);
    if (existingCategory) {
      throw new Error(`Category reference '${ref}' already exists`);
    }

    const now = Timestamp.now();

    const entity: CategoryEntity = {
      ref,
      name: data.name,
      icon: data.icon,
      type: data.type,
      color: data.color,
      description: data.description,
      budget: data.budget,
      isCustom: true,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await this.getUserCollectionReference().add(entity);
    const doc = await docRef.get();

    return doc.id;
  }

  async update(data: UpdateCategoryInput): Promise<void> {
    const category = await this.getCategoryById(data.id);
    if (!category) {
      throw new Error(`Category with id '${data.id}' not found`);
    }

    if (!category.isCustom) {
      throw new Error(`Cannot modify predefined category`);
    }

    const updates: Partial<CategoryEntity> = {};
    if (data.name !== undefined) updates.name = data.name;
    if (data.icon !== undefined) updates.icon = data.icon;
    if (data.color !== undefined) updates.color = data.color;
    if (data.description !== undefined) updates.description = data.description;
    if (data.budget !== undefined) updates.budget = data.budget;

    updates.updatedAt = Timestamp.now();

    await this.getUserCollectionReference().doc(data.id).update(updates);
  }

  async delete(id: string): Promise<void> {
    const category = await this.getCategoryById(id);
    if (!category) {
      throw new Error(`Category with id '${id}' not found`);
    }

    if (!category.isCustom) {
      throw new Error(`Cannot delete predefined category`);
    }

    await this.getUserCollectionReference().doc(id).update({ isDeleted: true });
  }
}
