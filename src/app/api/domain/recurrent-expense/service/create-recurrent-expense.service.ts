import type { RecurrentExpenseRepository } from "../repository/recurrent-expense.repository";
import { RecurrentExpenseModel } from "../model/recurrent-expense.model";
import {
  Injectable,
  InjectRepository,
} from "@/app/api/decorators/tsyringe.decorator";
import { DomainError } from "@/app/api/domain/errors/domain.error";

@Injectable()
export class CreateRecurrentExpenseService {
  constructor(
    @InjectRepository(RecurrentExpenseModel)
    private readonly recurrentExpenseRepository: RecurrentExpenseRepository
  ) {}

  async execute(recurrentExpense: RecurrentExpenseModel): Promise<string> {
    this.validateRequiredFields(recurrentExpense);

    recurrentExpense.disabled = recurrentExpense.disabled ?? false;

    const id = await this.recurrentExpenseRepository.create(recurrentExpense);

    return id;
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
