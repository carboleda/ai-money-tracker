import { Injectable, Inject } from "@/app/api/decorators/tsyringe.decorator";
import { TransactionRepository } from "@/app/api/domain/transaction/repository/transaction.repository";
import {
  TransactionModel,
  TransactionStatus,
} from "@/app/api/domain//transaction/model/transaction.model";
import { Filter, Firestore, UpdateData } from "firebase-admin/firestore";
import { TransactionAdapter } from "./transaction.adapter";
import { Collections } from "../types";
import { TransactionEntity } from "./transaction.entity";
import { FilterParams } from "@/app/api/domain/interfaces/transaction-filter.interface";

@Injectable()
export class TransactionFirestoreRepository implements TransactionRepository {
  constructor(@Inject(Firestore) private readonly firestore: Firestore) {}

  async getById(id: string): Promise<TransactionModel | null> {
    const docRef = this.firestore.collection(Collections.Transactions).doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return null;
    }

    const entity = { ...doc.data() } as TransactionEntity;
    return TransactionAdapter.toModel(entity, doc.id);
  }

  async create(transaction: TransactionModel): Promise<string> {
    const entity = TransactionAdapter.toEntity(transaction);
    const docRef = await this.firestore
      .collection(Collections.Transactions)
      .add(entity);
    return docRef.id;
  }

  async update(transaction: TransactionModel): Promise<void> {
    const entity = TransactionAdapter.toEntity(
      transaction
    ) as UpdateData<TransactionEntity>;
    const docRef = this.firestore
      .collection(Collections.Transactions)
      .doc(transaction.id);
    await docRef.update(entity);
  }

  async delete(id: string): Promise<void> {
    const docRef = this.firestore.collection(Collections.Transactions).doc(id);
    await docRef.delete();
  }

  async searchTransactions(params: FilterParams): Promise<TransactionModel[]> {
    const { status, account, startDate, endDate } = params;

    const collectionRef = this.firestore.collection(Collections.Transactions);
    let q = collectionRef.orderBy(
      "createdAt",
      status === TransactionStatus.PENDING ? "asc" : "desc"
    );

    if (startDate && endDate) {
      q = q
        .where("createdAt", ">=", startDate!)
        .where("createdAt", "<=", endDate!);
    }

    if (account) {
      q = q.where(
        Filter.and(
          Filter.or(
            Filter.where("sourceAccount", "==", account),
            Filter.where("destinationAccount", "==", account)
          )
        )
      );
    }

    const snapshot = await q.get();
    return snapshot.docs.map((doc) => {
      const entity = { ...doc.data() } as TransactionEntity;
      return TransactionAdapter.toModel(entity, doc.id);
    });
  }
}
