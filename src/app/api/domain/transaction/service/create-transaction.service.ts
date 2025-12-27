import type { TransactionRepository } from "../repository/transaction.repository";
import { TransactionModel, TransactionType } from "../model/transaction.model";
import {
  InjectRepository,
  Injectable,
} from "@/app/api/decorators/tsyringe.decorator";
import {
  EventTypes,
  TransactionCreatedEvent,
} from "@/app/api/domain/interfaces/account-events.interface";
import { pubsub } from "@/app/api/helpers/pubsub";
import { ValidateAccountService } from "@/app/api/domain/account/service/validate-account.service";

@Injectable()
export class CreateTransactionService {
  constructor(
    @InjectRepository(TransactionModel)
    private readonly transactionRepository: TransactionRepository,
    private readonly validateAccountService: ValidateAccountService
  ) {}

  async execute(input: Omit<TransactionModel, "id">): Promise<string> {
    // Validate that TRANSFER has destinationAccount
    if (input.type === TransactionType.TRANSFER && !input.destinationAccount) {
      throw new Error("Transfer transactions must have a destinationAccount");
    }

    // Validate accounts exist and are not deleted
    await this.validateAccountService.execute(
      input.sourceAccount.ref,
      input.destinationAccount?.ref
    );

    const id = await this.transactionRepository.create(input);

    await pubsub.emit(
      EventTypes.TRANSACTION_CREATED,
      new TransactionCreatedEvent({ ...input, id })
    );

    return id;
  }
}
