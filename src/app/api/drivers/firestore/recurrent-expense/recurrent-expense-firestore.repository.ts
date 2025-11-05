import { Firestore, UpdateData } from "firebase-admin/firestore";
import { Injectable, Inject } from "@/app/api/decorators/tsyringe.decorator";
import { RecurrentExpenseRepository } from "@/app/api/domain/recurrent-expense/repository/recurrent-expense.repository";
import { RecurrentExpenseModel } from "@/app/api/domain/recurrent-expense/model/recurrent-expense.model";
import { RecurrentExpenseAdapter } from "./recurrent-expense.adapter";
import { RecurrentExpenseEntity } from "./recurrent-expense.entity";
import { Collections } from "@/app/api/drivers/firestore/types";

@Injectable()
export class RecurrentExpenseFirestoreRepository
  implements RecurrentExpenseRepository
{
  constructor(@Inject(Firestore) private readonly firestore: Firestore) {}

  async getAll(): Promise<RecurrentExpenseModel[]> {
    const collectionRef = this.firestore.collection(
      Collections.RecurringExpenses
    );
    const q = collectionRef.orderBy("dueDate", "asc");
    const snapshot = await q.get();

    return snapshot.docs.map((doc) => {
      const entity = doc.data() as RecurrentExpenseEntity;
      return RecurrentExpenseAdapter.toModel(entity, doc.id);
    });
  }

  async getById(id: string): Promise<RecurrentExpenseModel | null> {
    const doc = await this.firestore
      .collection(Collections.RecurringExpenses)
      .doc(id)
      .get();

    if (!doc.exists) {
      return null;
    }

    const entity = doc.data() as RecurrentExpenseEntity;
    return RecurrentExpenseAdapter.toModel(entity, doc.id);
  }

  async create(recurrentExpense: RecurrentExpenseModel): Promise<string> {
    const entity = RecurrentExpenseAdapter.toEntity(recurrentExpense);
    const docRef = await this.firestore
      .collection(Collections.RecurringExpenses)
      .add(entity);
    return docRef.id;
  }

  async update(recurrentExpense: RecurrentExpenseModel): Promise<void> {
    const entity = RecurrentExpenseAdapter.toEntity(
      recurrentExpense
    ) as UpdateData<RecurrentExpenseEntity>;
    const docRef = this.firestore
      .collection(Collections.RecurringExpenses)
      .doc(recurrentExpense.id);
    await docRef.update(entity);
  }

  async delete(id: string): Promise<void> {
    const docRef = this.firestore
      .collection(Collections.RecurringExpenses)
      .doc(id);
    await docRef.delete();
  }
}
