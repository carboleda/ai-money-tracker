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
import { TransactionDto } from "../model/transaction.dto";

@Injectable()
export class UpdateTransactionService {
  constructor(
    @InjectRepository(TransactionModel)
    private readonly transactionRepository: TransactionRepository,
    private readonly validateAccountService: ValidateAccountService
  ) {}

  async execute(transaction: TransactionDto): Promise<void> {
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

    await this.transactionRepository.update({
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
      EventTypes.TRANSACTION_UPDATED,
      new TransactionUpdatedEvent(
        {
          ...oldTransaction,
          sourceAccount: oldTransaction.sourceAccount.ref,
          destinationAccount: oldTransaction.destinationAccount?.ref,
        },
        { ...transaction }
      )
    );
  }
}
