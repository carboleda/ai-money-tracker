import {
  TransactionEntity,
  TransactionStatus,
  TransactionType,
} from "@/interfaces/transaction";
import { OnEvent } from "@/app/api/event-bus/decorators";
import { EventTypes, SingleParamEvent, UpdateEvent } from "../event-bus";
import { AccountShareFunctions } from "./functions";
import { AccountEntity } from "@/interfaces/account";

export class AccountEvents {
  @OnEvent(EventTypes.TRANSACTION_CREATED)
  static async onTransactionCreated(
    transaction: SingleParamEvent<TransactionEntity>
  ) {
    console.log("onTransactionCreated(RECEIVED)");
    const accountEntities = AccountEvents.handleEvent(transaction, false);
    console.log("onTransactionCreated(UPDATING ACCOUNTS)", { accountEntities });
    for await (const account of accountEntities) {
      await AccountShareFunctions.updateOrCreateAccount(
        account.account,
        account.balance
      );
    }
  }

  @OnEvent(EventTypes.TRANSACTION_DELETED)
  static async onTransactionDeleted(
    transaction: SingleParamEvent<TransactionEntity>
  ) {
    console.log("onTransactionDeleted(RECEIVED)");
    const accountEntities = AccountEvents.handleEvent(transaction, true);

    console.log("onTransactionDeleted(UPDATING ACCOUNTS)", { accountEntities });
    for (const account of accountEntities) {
      await AccountShareFunctions.updateOrCreateAccount(
        account.account,
        account.balance
      );
    }
  }

  @OnEvent(EventTypes.TRANSACTION_UPDATED)
  static async onTransactionUpdated({
    oldData: oldTransaction,
    newData: newTransaction,
  }: UpdateEvent<TransactionEntity>) {
    console.log("onTransactionUpdated(RECEIVED)");

    if (
      oldTransaction.amount === newTransaction.amount &&
      oldTransaction.sourceAccount === newTransaction.sourceAccount &&
      oldTransaction.destinationAccount === newTransaction.destinationAccount
    ) {
      console.log(
        "onTransactionUpdated(DISCARDED)",
        "No relevant changes in transaction"
      );
      return;
    }

    const oldAccountEntities = AccountEvents.handleEvent(oldTransaction, true);
    const newAccountEntities = AccountEvents.handleEvent(newTransaction, false);

    const mergedAccountEntities = [
      ...oldAccountEntities,
      ...newAccountEntities,
    ];

    if (mergedAccountEntities.length === 0) {
      return;
    }

    const updates = mergedAccountEntities.reduce((updates, update) => {
      if (!updates[update.account]) {
        updates[update.account] = 0;
      }

      updates[update.account] += update.balance;

      return updates;
    }, {} as Record<string, number>);

    return Promise.all(
      Object.entries(updates).map(async ([account, balance]) =>
        AccountShareFunctions.updateOrCreateAccount(account, balance)
      )
    );
  }

  private static handleEvent(
    transaction: TransactionEntity,
    isRollback: boolean
  ) {
    if (
      transaction.status === TransactionStatus.PENDING ||
      (!transaction.sourceAccount && !transaction.destinationAccount)
    ) {
      return [];
    }

    const accountEntities: AccountEntity[] = [];
    if (transaction.type === TransactionType.TRANSFER) {
      accountEntities.push({
        account: transaction.sourceAccount,
        balance: transaction.amount * (isRollback ? 1 : -1),
      });

      accountEntities.push({
        account: transaction.destinationAccount!,
        balance: transaction.amount * (isRollback ? -1 : 1),
      });
    } else {
      accountEntities.push({
        account: transaction.sourceAccount,
        balance:
          transaction.amount *
          (transaction.type === TransactionType.EXPENSE ? -1 : 1) *
          (isRollback ? -1 : 1),
      });
    }

    return accountEntities;
  }
}
