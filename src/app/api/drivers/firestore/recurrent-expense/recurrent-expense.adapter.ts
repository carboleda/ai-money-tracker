import type { CategorySummary } from "@/app/api/domain/transaction/model/transaction.model";
import { RecurrentExpenseModel } from "@/app/api/domain/recurrent-expense/model/recurrent-expense.model";
import { RecurrentExpenseEntity } from "./recurrent-expense.entity";
import { Timestamp } from "firebase-admin/firestore";

export class RecurrentExpenseAdapter {
  static toModel(
    entity: RecurrentExpenseEntity,
    id: string
  ): RecurrentExpenseModel {
    return new RecurrentExpenseModel({
      id,
      description: entity.description,
      category: RecurrentExpenseAdapter.fallbackCategorySummary(
        entity.category
      ),
      frequency: entity.frequency,
      dueDate: entity.dueDate.toDate(),
      disabled: entity.disabled,
      amount: entity.amount,
      paymentLink: entity.paymentLink,
      notes: entity.notes,
    });
  }

  static toEntity(model: RecurrentExpenseModel): RecurrentExpenseEntity {
    const { category } = model;
    const categoryRef =
      typeof category === "string" ? category : category.ref;

    return {
      description: model.description,
      category: categoryRef,
      frequency: model.frequency,
      dueDate: Timestamp.fromDate(model.dueDate),
      disabled: model.disabled,
      amount: model.amount,
      paymentLink: model.paymentLink,
      notes: model.notes,
    };
  }

  /**
   * Provides a fallback mechanism to ensure a CategorySummary object is returned.
   * If the input is a string (category reference), it creates a minimal CategorySummary
   * with the reference populated and other fields set to null. If the input is already
   * a CategorySummary object (after enrichment by the repository), it returns it as-is.
   */
  static fallbackCategorySummary(
    category: CategorySummary | string
  ): CategorySummary {
    if (typeof category !== "string") {
      return category;
    }

    return {
      ref: category,
      name: "Unknown",
      icon: null,
      color: null,
    };
  }
}
