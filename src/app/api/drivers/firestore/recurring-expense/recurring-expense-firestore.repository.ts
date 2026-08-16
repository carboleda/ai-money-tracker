import { Collections } from "@/app/api/drivers/firestore/types";
import { Firestore, UpdateData } from "firebase-admin/firestore";
import {
  Injectable,
  Inject,
  InjectUserContext,
  InjectRepository,
} from "@/app/api/decorators/tsyringe.decorator";
import { RecurringExpenseRepository } from "@/app/api/domain/recurring-expense/repository/recurring-expense.repository";
import { RecurringExpenseModel } from "@/app/api/domain/recurring-expense/model/recurring-expense.model";
import type { CategorySummary } from "@/app/api/domain/transaction/model/transaction.model";
import { RecurringExpenseAdapter } from "./recurring-expense.adapter";
import { RecurringExpenseEntity } from "./recurring-expense.entity";
import { BaseFirestoreRepository } from "@/app/api/drivers/firestore/base/base.firestore.repository";
import type { UserContext } from "@/app/api/context/user-context";
import type { CategoryRepository } from "@/app/api/domain/category/repository/category.repository";
import {
  CategoryModel,
  PredefinedCategory,
} from "@/app/api/domain/category/model/category.model";
import { loadPredefinedCategoryMap } from "@/app/api/drivers/firestore/category/predefined-category.helper";

@Injectable()
export class RecurringExpenseFirestoreRepository
  extends BaseFirestoreRepository
  implements RecurringExpenseRepository
{
  private readonly predefinedCategoryMap: Map<string, PredefinedCategory> =
    loadPredefinedCategoryMap();

  constructor(
    @Inject(Firestore) firestore: Firestore,
    @InjectUserContext() userContext: UserContext,
    @InjectRepository(CategoryModel)
    private readonly categoryRepository: CategoryRepository
  ) {
    super(Collections.RecurringExpenses, firestore, userContext);
  }

  /**
   * Enriches recurring expense entities with full CategorySummary objects
   * by joining against custom and predefined categories.
   */
  private async enrichWithCategories(
    entities: Array<RecurringExpenseEntity & { id: string }>
  ): Promise<Array<RecurringExpenseEntity & { id: string }>> {
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

  async getAll(): Promise<RecurringExpenseModel[]> {
    const q = this.getUserCollectionReference().orderBy("dueDate", "asc");
    const snapshot = await q.get();

    const entities = snapshot.docs.map((doc) => ({
      ...(doc.data() as RecurringExpenseEntity),
      id: doc.id,
    }));

    const enriched = await this.enrichWithCategories(entities);

    return enriched.map((entity) =>
      RecurringExpenseAdapter.toModel(entity, entity.id)
    );
  }

  async getById(id: string): Promise<RecurringExpenseModel | null> {
    const doc = await this.getUserCollectionReference().doc(id).get();

    if (!doc.exists) {
      return null;
    }

    const entity = { ...(doc.data() as RecurringExpenseEntity), id: doc.id };
    const enriched = await this.enrichWithCategories([entity]);
    return RecurringExpenseAdapter.toModel(enriched[0], doc.id);
  }

  async create(recurringExpense: RecurringExpenseModel): Promise<string> {
    const entity = RecurringExpenseAdapter.toEntity(recurringExpense);
    const docRef = await this.getUserCollectionReference().add(entity);
    return docRef.id;
  }

  async update(recurringExpense: RecurringExpenseModel): Promise<void> {
    const entity = RecurringExpenseAdapter.toEntity(
      recurringExpense
    ) as UpdateData<RecurringExpenseEntity>;
    const docRef = this.getUserCollectionReference().doc(recurringExpense.id);
    await docRef.update(entity);
  }

  async delete(id: string): Promise<void> {
    const docRef = this.getUserCollectionReference().doc(id);
    await docRef.delete();
  }
}
