import type { CategorySummary } from "@/app/api/domain/transaction/model/transaction.model";
import {
  RecurrentExpenseModel,
} from "@/app/api/domain/recurrent-expense/model/recurrent-expense.model";
import type { CreateRecurrentExpenseInput } from "../ports/inbound/create-recurrent-expense.port";
import type { UpdateRecurrentExpenseInput } from "../ports/inbound/update-recurrent-expense.port";
import type { RecurrentExpenseOutput } from "../ports/outbound/get-recurrent-expenses.port";

export class RecurrentExpenseMapper {
  static fromCreateToModel(
    input: CreateRecurrentExpenseInput
  ): RecurrentExpenseModel {
    return new RecurrentExpenseModel({
      ...input,
      id: "",
      disabled: input.disabled ?? false,
    });
  }

  static fromUpdateToModel(
    input: UpdateRecurrentExpenseInput
  ): RecurrentExpenseModel {
    return new RecurrentExpenseModel({
      ...input,
      dueDate: new Date(input.dueDate),
    });
  }

  static toOutputPort(model: RecurrentExpenseModel): RecurrentExpenseOutput {
    const category = RecurrentExpenseMapper.resolveCategorySummary(
      model.category
    );

    return {
      id: model.id,
      description: model.description,
      category,
      frequency: model.frequency,
      dueDate: model.dueDate.toISOString(),
      disabled: model.disabled,
      amount: model.amount,
      paymentLink: model.paymentLink,
      notes: model.notes,
    };
  }

  private static resolveCategorySummary(
    category: CategorySummary | string
  ): CategorySummary {
    if (typeof category !== "string") {
      return category;
    }

    return {
      ref: category,
      name: category,
      icon: null,
      color: null,
    };
  }
}
