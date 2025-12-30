import type { TransactionRepository } from "../repository/transaction.repository";
import { TransactionModel, TransactionType } from "../model/transaction.model";
import {
  InjectRepository,
  Injectable,
} from "@/app/api/decorators/tsyringe.decorator";
import {
  EventTypes,
  TransactionCreatedEvent,
} from "@/app/api/domain/shared/interfaces/account-events.interface";
import { pubsub } from "@/app/api/helpers/pubsub";
import { ValidateAccountService } from "@/app/api/domain/account/service/validate-account.service";
import { CreateTransactionInput } from "../ports/inbound/create-transaction.port";
import { Service } from "@/app/api/domain/shared/ports/service.interface";
import { TransactionMapper } from "../mapper/transaction.mapper";

@Injectable()
export class CreateTransactionService
  implements Service<CreateTransactionInput, string>
{
  constructor(
    @InjectRepository(TransactionModel)
    private readonly transactionRepository: TransactionRepository,
    private readonly validateAccountService: ValidateAccountService
  ) {}

  async execute(transaction: CreateTransactionInput): Promise<string> {
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

    const transactionModel = TransactionMapper.fromCreateToModel(transaction);
    const id = await this.transactionRepository.create(transactionModel);

    await pubsub.emit(
      EventTypes.TRANSACTION_CREATED,
      new TransactionCreatedEvent({ ...transactionModel, id })
    );

    return id;
  }
}
