import {
  TransactionStatus,
  TransactionType,
} from "@/app/api/domain/transaction/model/transaction.model";
import type {
  TransactionCreatedEvent,
  TransactionDeletedEvent,
  TransactionUpdatedEvent,
} from "@/app/api/domain/interfaces/account-events.interface";
import { EventTypes } from "@/app/api/domain/interfaces/account-events.interface";
import { AccountModel } from "@/app/api/domain/account/model/account.model";
import {
  InjectRepository,
  Injectable,
  OnEvent,
} from "@/app/api/decorators/tsyringe.decorator";
import type { AccountRepository } from "../repository/account.repository";
import { TransactionDto } from "../../transaction/model/transaction.dto";

type AccountModelForUpdate = Pick<AccountModel, "ref" | "balance">;

@Injectable()
export class AccountEventsService {
  constructor(
    @InjectRepository(AccountModel)
    private readonly accountRepository: AccountRepository
  ) {}

  @OnEvent(EventTypes.TRANSACTION_CREATED)
  async onTransactionCreated(event: TransactionCreatedEvent) {
    console.log("onTransactionCreated(RECEIVED)");
    const accountEntities = this.handleEvent(event.transaction, false);
    console.log("onTransactionCreated(UPDATING ACCOUNTS)", {
      accountEntities,
    });
    for (const account of accountEntities) {
      await this.accountRepository.updateOrCreateAccount(
        account.ref,
        account.balance
      );
    }
  }

  @OnEvent(EventTypes.TRANSACTION_DELETED)
  async onTransactionDeleted(event: TransactionDeletedEvent) {
    console.log("onTransactionDeleted(RECEIVED)");
    const accountEntities = this.handleEvent(event.transaction, true);

    console.log("onTransactionDeleted(UPDATING ACCOUNTS)", {
      accountEntities,
    });
    for (const account of accountEntities) {
      await this.accountRepository.updateOrCreateAccount(
        account.ref,
        account.balance
      );
    }
  }

  @OnEvent(EventTypes.TRANSACTION_UPDATED)
  async onTransactionUpdated(event: TransactionUpdatedEvent): Promise<void> {
    console.log("onTransactionUpdated(RECEIVED)");

    const { oldData: oldTransaction, newData: newTransaction } = event;

    if (
      oldTransaction.amount === newTransaction.amount &&
      oldTransaction.sourceAccount === newTransaction.sourceAccount &&
      oldTransaction.destinationAccount === newTransaction.destinationAccount
    ) {
      console.log(
        "onTransactionUpdated(DISCARDED) No relevant changes in transaction"
      );
      return;
    }

    const oldAccountEntities = this.handleEvent(oldTransaction, true);
    const newAccountEntities = this.handleEvent(newTransaction, false);

    const mergedAccountEntities = [
      ...oldAccountEntities,
      ...newAccountEntities,
    ];

    if (mergedAccountEntities.length === 0) {
      return;
    }

    const updates = mergedAccountEntities.reduce((updates, update) => {
      if (!updates[update.ref]) {
        updates[update.ref] = 0;
      }
      updates[update.ref] += update.balance;
      return updates;
    }, {} as Record<string, number>);

    await Promise.all(
      Object.entries(updates).map(async ([account, balance]) =>
        this.accountRepository.updateOrCreateAccount(account, balance)
      )
    );
  }

  private handleEvent(transaction: TransactionDto, isRollback: boolean) {
    if (
      transaction.status === TransactionStatus.PENDING ||
      (!transaction.sourceAccount && !transaction.destinationAccount)
    ) {
      return [];
    }

    const accountEntities: AccountModelForUpdate[] = [];
    if (transaction.type === TransactionType.TRANSFER) {
      accountEntities.push(
        {
          ref: transaction.sourceAccount,
          balance: transaction.amount * (isRollback ? 1 : -1),
        },
        {
          ref: transaction.destinationAccount!,
          balance: transaction.amount * (isRollback ? -1 : 1),
        }
      );
    } else {
      accountEntities.push({
        ref: transaction.sourceAccount,
        balance:
          transaction.amount *
          (transaction.type === TransactionType.EXPENSE ? -1 : 1) *
          (isRollback ? -1 : 1),
      });
    }

    return accountEntities;
  }
}
