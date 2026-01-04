import type { RecurrentExpenseRepository } from "../repository/recurrent-expense.repository";
import { RecurrentExpenseModel } from "../model/recurrent-expense.model";
import {
  Injectable,
  InjectRepository,
} from "@/app/api/decorators/tsyringe.decorator";
import { DomainError } from "@/app/api/domain/shared/errors/domain.error";

@Injectable()
export class DeleteRecurrentExpenseService {
  constructor(
    @InjectRepository(RecurrentExpenseModel)
    private readonly recurrentExpenseRepository: RecurrentExpenseRepository
  ) {}

  async execute(id: string): Promise<void> {
    if (!id) {
      throw new DomainError("Recurrent expense ID is required", 400);
    }

    const existingExpense = await this.recurrentExpenseRepository.getById(id);
    if (!existingExpense) {
      throw new DomainError("Recurrent expense not found", 404);
    }

    await this.recurrentExpenseRepository.delete(id);
  }
}
