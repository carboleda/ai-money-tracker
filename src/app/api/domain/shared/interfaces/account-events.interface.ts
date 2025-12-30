import { TransactionModel } from "@/app/api/domain/transaction/model/transaction.model";

export enum EventTypes {
  TRANSACTION_CREATED = "transaction.created",
  TRANSACTION_DELETED = "transaction.deleted",
  TRANSACTION_UPDATED = "transaction.updated",
}

export class TransactionCreatedEvent {
  constructor(public readonly transaction: TransactionModel) {}
}

export class TransactionDeletedEvent {
  constructor(public readonly transaction: TransactionModel) {}
}

export class TransactionUpdatedEvent {
  constructor(
    public readonly oldData: TransactionModel,
    public readonly newData: TransactionModel
  ) {}
}
