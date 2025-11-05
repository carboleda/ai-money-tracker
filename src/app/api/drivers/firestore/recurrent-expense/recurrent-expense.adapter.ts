import { RecurrentExpenseModel } from "@/app/api/domain/recurrent-expense/model/recurrent-expense.model";
import { RecurrentExpenseEntity } from "./recurrent-expense.entity";
import { Timestamp } from "firebase-admin/firestore";

export class RecurrentExpenseAdapter {
  static toModel(entity: RecurrentExpenseEntity, id: string): RecurrentExpenseModel {
    return new RecurrentExpenseModel({
      id,
      description: entity.description,
      category: entity.category,
      frequency: entity.frequency,
      dueDate: entity.dueDate.toDate(),
      disabled: entity.disabled,
      amount: entity.amount,
      paymentLink: entity.paymentLink,
      notes: entity.notes,
    });
  }

  static toEntity(model: RecurrentExpenseModel): RecurrentExpenseEntity {
    return {
      description: model.description,
      category: model.category,
      frequency: model.frequency,
      dueDate: Timestamp.fromDate(model.dueDate),
      disabled: model.disabled,
      amount: model.amount,
      paymentLink: model.paymentLink,
      notes: model.notes,
    };
  }
} 