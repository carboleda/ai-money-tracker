import { SummaryHistoryModel } from "@/app/api/domain/summary/model/summary-history.model";
import { SummaryHistoryEntity } from "./summary-history.entity";
import { Timestamp } from "firebase-admin/firestore";

export class SummaryHistoryAdapter {
  static toModel(
    entity: SummaryHistoryEntity,
    id: string
  ): SummaryHistoryModel {
    return new SummaryHistoryModel({
      id,
      incomes: entity.incomes,
      expenses: entity.expenses,
      transfers: entity.transfers,
      createdAt: entity.createdAt.toDate(),
    });
  }

  static toEntity(model: SummaryHistoryModel): SummaryHistoryEntity {
    return {
      incomes: model.incomes,
      expenses: model.expenses,
      transfers: model.transfers,
      createdAt: Timestamp.fromDate(model.createdAt),
    };
  }
}
