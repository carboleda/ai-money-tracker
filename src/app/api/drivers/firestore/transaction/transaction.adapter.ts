import { TransactionModel } from "@/app/api/domain/transaction/model/transaction.model";
import { TransactionEntity } from "./transaction.entity";
import { Timestamp } from "firebase-admin/firestore";

export class TransactionAdapter {
  static toModel(entity: TransactionEntity, id: string): TransactionModel {
    return new TransactionModel({
      ...entity,
      id,
      createdAt: entity.createdAt.toDate(),
      isRecurrent: entity.isRecurrent ?? false,
    });
  }

  static toEntity(model: TransactionModel): TransactionEntity {
    const { id: _, ...rest } = model;
    return {
      ...rest,
      createdAt: Timestamp.fromDate(model.createdAt),
    };
  }
}
