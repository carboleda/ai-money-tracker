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
import { TransactionDto } from "../model/transaction.dto";

@Injectable()
export class CreateTransactionService {
  constructor(
    @InjectRepository(TransactionModel)
    private readonly transactionRepository: TransactionRepository,
    private readonly validateAccountService: ValidateAccountService
  ) {}

  async execute(transaction: TransactionDto): Promise<string> {
    // Validate that TRANSFER has destinationAccount
    if (
      transaction.type === TransactionType.TRANSFER &&
      !transaction.destinationAccount
    ) {
      throw new Error("Transfer transactions must have a destinationAccount");
    }

    // Validate accounts exist and are not deleted
    await this.validateAccountService.execute(
      transaction.sourceAccount,
      transaction.destinationAccount
    );

    const id = await this.transactionRepository.create({
      ...transaction,
      sourceAccount: {
        ref: transaction.sourceAccount,
      },
      destinationAccount: transaction.destinationAccount
        ? {
            ref: transaction.destinationAccount,
          }
        : undefined,
    });

    await pubsub.emit(
      EventTypes.TRANSACTION_CREATED,
      new TransactionCreatedEvent({ ...transaction, id })
    );

    return id;
  }
}
