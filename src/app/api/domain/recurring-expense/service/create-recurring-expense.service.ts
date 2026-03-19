import type { RecurringExpenseRepository } from "../repository/recurring-expense.repository";
import { RecurringExpenseModel } from "../model/recurring-expense.model";
import {
  Injectable,
  InjectRepository,
} from "@/app/api/decorators/tsyringe.decorator";
import { DomainError } from "@/app/api/domain/shared/errors/domain.error";
import type { CreateRecurringExpenseInput } from "../ports/inbound/create-recurring-expense.port";
import { RecurringExpenseMapper } from "../mapper/recurring-expense.mapper";
import { Service } from "@/app/api/domain/shared/ports/service.interface";

@Injectable()
export class CreateRecurringExpenseService
  implements Service<CreateRecurringExpenseInput, string>
{
  constructor(
    @InjectRepository(RecurringExpenseModel)
    private readonly recurringExpenseRepository: RecurringExpenseRepository
  ) {}

  async execute(input: CreateRecurringExpenseInput): Promise<string> {
    this.validateRequiredFields(input);

    const model = RecurringExpenseMapper.fromCreateToModel(input);
    const id = await this.recurringExpenseRepository.create(model);

    return id;
  }

  private validateRequiredFields(input: CreateRecurringExpenseInput) {
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
