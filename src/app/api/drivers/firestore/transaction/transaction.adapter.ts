import { TransactionModel } from "@/app/api/domain/transaction/model/transaction.model";
import { TransactionEntity } from "./transaction.entity";
import { Timestamp } from "firebase-admin/firestore";
import { Utilities } from "@/app/api/helpers/utils";

export class TransactionAdapter {
  static toModel(entity: TransactionEntity, id: string): TransactionModel {
    return new TransactionModel({
      ...entity,
      id,
      createdAt: entity.createdAt.toDate(),
      sourceAccount: Utilities.getAccountName(entity.sourceAccount),
      destinationAccount:
        entity.destinationAccount &&
        Utilities.getAccountName(entity.destinationAccount),
      isRecurrent: !!id,
    });
  }

  static toEntity(model: TransactionModel): TransactionEntity {
    return {
      ...model,
      createdAt: Timestamp.fromDate(model.createdAt),
    };
  }
}
