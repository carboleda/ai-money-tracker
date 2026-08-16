import type { RecurringExpenseRepository } from "../repository/recurring-expense.repository";
import { RecurringExpenseModel } from "../model/recurring-expense.model";
import {
  Injectable,
  InjectRepository,
} from "@/app/api/decorators/tsyringe.decorator";
import { DomainError } from "@/app/api/domain/shared/errors/domain.error";
import type { UpdateRecurringExpenseInput } from "../ports/inbound/update-recurring-expense.port";
import { RecurringExpenseMapper } from "../mapper/recurring-expense.mapper";
import { Service } from "@/app/api/domain/shared/ports/service.interface";

@Injectable()
export class UpdateRecurringExpenseService
  implements Service<UpdateRecurringExpenseInput, void>
{
  constructor(
    @InjectRepository(RecurringExpenseModel)
    private readonly recurringExpenseRepository: RecurringExpenseRepository
  ) {}

  async execute(input: UpdateRecurringExpenseInput): Promise<void> {
    if (!input.id) {
      throw new DomainError("Recurring expense ID is required", 400);
    }

    this.validateRequiredFields(input);

    const model = RecurringExpenseMapper.fromUpdateToModel(input);
    await this.recurringExpenseRepository.update(model);
  }

  private validateRequiredFields(input: UpdateRecurringExpenseInput) {
    if (
      !input.description ||
      !input.category ||
      !input.frequency ||
      !input.dueDate ||
      input.amount === null ||
      input.amount === undefined
    ) {
      throw new DomainError("Missing required fields", 400);
    }

    if (input.amount <= 0) {
      throw new DomainError("Amount must be greater than 0", 400);
    }
  }
}
