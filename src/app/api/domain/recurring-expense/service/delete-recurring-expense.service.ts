import type { RecurringExpenseRepository } from "../repository/recurring-expense.repository";
import { RecurringExpenseModel } from "../model/recurring-expense.model";
import {
  Injectable,
  InjectRepository,
} from "@/app/api/decorators/tsyringe.decorator";
import { DomainError } from "@/app/api/domain/shared/errors/domain.error";

@Injectable()
export class DeleteRecurringExpenseService {
  constructor(
    @InjectRepository(RecurringExpenseModel)
    private readonly recurringExpenseRepository: RecurringExpenseRepository
  ) {}

  async execute(id: string): Promise<void> {
    if (!id) {
      throw new DomainError("Recurring expense ID is required", 400);
    }

    const existingExpense = await this.recurringExpenseRepository.getById(id);
    if (!existingExpense) {
      throw new DomainError("Recurring expense not found", 404);
    }

    await this.recurringExpenseRepository.delete(id);
  }
}
