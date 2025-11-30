import { Collections } from "@/app/api/drivers/firestore/types";
import { Firestore, UpdateData } from "firebase-admin/firestore";
import {
  Injectable,
  Inject,
  InjectUserId,
} from "@/app/api/decorators/tsyringe.decorator";
import { RecurrentExpenseRepository } from "@/app/api/domain/recurrent-expense/repository/recurrent-expense.repository";
import { RecurrentExpenseModel } from "@/app/api/domain/recurrent-expense/model/recurrent-expense.model";
import { RecurrentExpenseAdapter } from "./recurrent-expense.adapter";
import { RecurrentExpenseEntity } from "./recurrent-expense.entity";
import { BaseFirestoreRepository } from "@/app/api/drivers/firestore/base/base.firestore.repository";

@Injectable()
export class RecurrentExpenseFirestoreRepository
  extends BaseFirestoreRepository
  implements RecurrentExpenseRepository
{
  constructor(
    @Inject(Firestore) firestore: Firestore,
    @InjectUserId() userId: string
  ) {
    super(Collections.RecurringExpenses, firestore, userId);
  }

  async getAll(): Promise<RecurrentExpenseModel[]> {
    const q = this.getUserCollectionReference().orderBy("dueDate", "asc");
    const snapshot = await q.get();

    return snapshot.docs.map((doc) => {
      const entity = doc.data() as RecurrentExpenseEntity;
      return RecurrentExpenseAdapter.toModel(entity, doc.id);
    });
  }

  async getById(id: string): Promise<RecurrentExpenseModel | null> {
    const doc = await this.getUserCollectionReference().doc(id).get();

    if (!doc.exists) {
      return null;
    }

    const entity = doc.data() as RecurrentExpenseEntity;
    return RecurrentExpenseAdapter.toModel(entity, doc.id);
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
