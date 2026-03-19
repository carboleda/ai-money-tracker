import { Collections } from "@/app/api/drivers/firestore/types";
import { Firestore, UpdateData } from "firebase-admin/firestore";
import {
  Injectable,
  Inject,
  InjectUserContext,
  InjectRepository,
} from "@/app/api/decorators/tsyringe.decorator";
import { RecurrentExpenseRepository } from "@/app/api/domain/recurrent-expense/repository/recurrent-expense.repository";
import { RecurrentExpenseModel } from "@/app/api/domain/recurrent-expense/model/recurrent-expense.model";
import type { CategorySummary } from "@/app/api/domain/transaction/model/transaction.model";
import { RecurrentExpenseAdapter } from "./recurrent-expense.adapter";
import { RecurrentExpenseEntity } from "./recurrent-expense.entity";
import { BaseFirestoreRepository } from "@/app/api/drivers/firestore/base/base.firestore.repository";
import type { UserContext } from "@/app/api/context/user-context";
import type { CategoryRepository } from "@/app/api/domain/category/repository/category.repository";
import { CategoryModel } from "@/app/api/domain/category/model/category.model";
import * as fs from "node:fs";
import * as path from "node:path";

interface PredefinedCategory {
  ref: string;
  name: string;
  icon: string;
  color: string;
  type: string;
  description: string;
}

@Injectable()
export class RecurrentExpenseFirestoreRepository
  extends BaseFirestoreRepository
  implements RecurrentExpenseRepository
{
  private readonly predefinedCategoryMap: Map<string, PredefinedCategory> =
    new Map();

  constructor(
    @Inject(Firestore) firestore: Firestore,
    @InjectUserContext() userContext: UserContext,
    @InjectRepository(CategoryModel)
    private readonly categoryRepository: CategoryRepository
  ) {
    super(Collections.RecurringExpenses, firestore, userContext);
    this.loadPredefinedCategories();
  }

  private loadPredefinedCategories(): void {
    try {
      const filePath = path.join(
        process.cwd(),
        "src/config/predefined-categories.json"
      );
      const jsonData = fs.readFileSync(filePath, "utf-8");
      const categories: PredefinedCategory[] = JSON.parse(jsonData);

      categories.forEach((cat) => {
        this.predefinedCategoryMap.set(cat.ref, cat);
      });
    } catch (error) {
      console.error("Failed to load predefined categories:", error);
    }
  }

  /**
   * Enriches recurrent expense entities with full CategorySummary objects
   * by joining against custom and predefined categories.
   */
  private async enrichWithCategories(
    entities: Array<RecurrentExpenseEntity & { id: string }>
  ): Promise<Array<RecurrentExpenseEntity & { id: string }>> {
    const customCategories = await this.categoryRepository.getAll();

    const customCategoryMap = new Map<string, CategorySummary>();
    customCategories.forEach((cat) => {
      customCategoryMap.set(cat.ref, {
        ref: cat.ref,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        isCustom: cat.isCustom,
      });
    });

    return entities.map((entity) => {
      const categoryRef = entity.category;

      let categorySummary: CategorySummary | undefined;
      if (customCategoryMap.has(categoryRef)) {
        categorySummary = customCategoryMap.get(categoryRef);
      } else if (this.predefinedCategoryMap.has(categoryRef)) {
        const predefined = this.predefinedCategoryMap.get(categoryRef)!;
        categorySummary = {
          ref: predefined.ref,
          name: predefined.name,
          icon: predefined.icon,
          color: predefined.color,
          isCustom: false,
        };
      }

      return {
        ...entity,
        category: (categorySummary ?? categoryRef) as any,
      };
    });
  }

  async getAll(): Promise<RecurrentExpenseModel[]> {
    const q = this.getUserCollectionReference().orderBy("dueDate", "asc");
    const snapshot = await q.get();

    const entities = snapshot.docs.map((doc) => ({
      ...(doc.data() as RecurrentExpenseEntity),
      id: doc.id,
    }));

    const enriched = await this.enrichWithCategories(entities);

    return enriched.map((entity) =>
      RecurrentExpenseAdapter.toModel(entity, entity.id)
    );
  }

  async getById(id: string): Promise<RecurrentExpenseModel | null> {
    const doc = await this.getUserCollectionReference().doc(id).get();

    if (!doc.exists) {
      return null;
    }

    const entity = { ...(doc.data() as RecurrentExpenseEntity), id: doc.id };
    const enriched = await this.enrichWithCategories([entity]);
    return RecurrentExpenseAdapter.toModel(enriched[0], doc.id);
  }

  async create(recurrentExpense: RecurrentExpenseModel): Promise<string> {
    const entity = RecurrentExpenseAdapter.toEntity(recurrentExpense);
    const docRef = await this.getUserCollectionReference().add(entity);
    return docRef.id;
  }

  async update(recurrentExpense: RecurrentExpenseModel): Promise<void> {
    const entity = RecurrentExpenseAdapter.toEntity(
      recurrentExpense
    ) as UpdateData<RecurrentExpenseEntity>;
    const docRef = this.getUserCollectionReference().doc(recurrentExpense.id);
    await docRef.update(entity);
  }

  async delete(id: string): Promise<void> {
    const docRef = this.getUserCollectionReference().doc(id);
    await docRef.delete();
  }
}
