import type { TransactionRepository } from "../repository/transaction.repository";
import { TransactionModel, TransactionType } from "../model/transaction.model";
import {
  InjectRepository,
  Injectable,
} from "@/app/api/decorators/tsyringe.decorator";
import {
  EventTypes,
  TransactionUpdatedEvent,
} from "@/app/api/domain/shared/interfaces/account-events.interface";
import { DomainError } from "@/app/api/domain/shared/errors/domain.error";
import { pubsub } from "@/app/api/helpers/pubsub";
import { ValidateAccountService } from "@/app/api/domain/account/service/validate-account.service";
import { UpdateTransactionInput } from "../ports/inbound/update-transaction.port";
import { Service } from "@/app/api/domain/shared/ports/service.interface";
import { TransactionMapper } from "../mapper/transaction.mapper";

@Injectable()
export class UpdateTransactionService
  implements Service<UpdateTransactionInput, void>
{
  constructor(
    @InjectRepository(TransactionModel)
    private readonly transactionRepository: TransactionRepository,
    private readonly validateAccountService: ValidateAccountService
  ) {}

  async execute(transaction: UpdateTransactionInput): Promise<void> {
    const oldTransaction = await this.transactionRepository.getById(
      transaction.id
    );
    if (!oldTransaction) {
      throw new DomainError("Transaction not found", 404);
    }

    // Validate that TRANSFER has destinationAccount
    if (
      transaction.type === TransactionType.TRANSFER &&
      !transaction.destinationAccount
    ) {
      throw new Error("Transfer transactions must have a destinationAccount");
    }

    // Validate accounts exist and are not deleted
    await this.validateAccountService.execute({
      sourceAccount: transaction.sourceAccount,
      destinationAccount: transaction.destinationAccount,
    });

    const transactionModel = TransactionMapper.fromUpdateToModel(transaction);
    await this.transactionRepository.update(transactionModel);

    await pubsub.emit(
      EventTypes.TRANSACTION_UPDATED,
      new TransactionUpdatedEvent(
        {
          ...oldTransaction,
        },
        { ...transactionModel }
      )
    );
  }
}
