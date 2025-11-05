import type { RecurrentExpenseRepository } from "../repository/recurrent-expense.repository";
import { RecurrentExpenseModel } from "../model/recurrent-expense.model";
import {
  Injectable,
  InjectRepository,
} from "@/app/api/decorators/tsyringe.decorator";
import { DomainError } from "@/app/api/domain/errors/domain.error";

@Injectable()
export class UpdateRecurrentExpenseService {
  constructor(
    @InjectRepository(RecurrentExpenseModel)
    private readonly recurrentExpenseRepository: RecurrentExpenseRepository
  ) {}

  async execute(recurrentExpense: RecurrentExpenseModel): Promise<void> {
    if (!recurrentExpense.id) {
      throw new DomainError("Recurrent expense ID is required", 400);
    }

    this.validateRequiredFields(recurrentExpense);

    // Ensure dueDate is a Date object
    const updatedRecurrentExpense = new RecurrentExpenseModel({
      ...recurrentExpense,
      dueDate: new Date(recurrentExpense.dueDate),
    });

    await this.recurrentExpenseRepository.update(updatedRecurrentExpense);
  }

  private validateRequiredFields(recurrentExpense: RecurrentExpenseModel) {
    if (
      !recurrentExpense.description ||
      !recurrentExpense.category ||
      !recurrentExpense.frequency ||
      !recurrentExpense.dueDate ||
      recurrentExpense.amount === null ||
      recurrentExpense.amount === undefined
    ) {
      throw new DomainError("Missing required fields", 400);
    }

    if (recurrentExpense.amount <= 0) {
      throw new DomainError("Amount must be greater than 0", 400);
    }
  }
}
