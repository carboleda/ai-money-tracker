import { TransactionDto } from "../transaction/model/transaction.dto";

export enum EventTypes {
  TRANSACTION_CREATED = "transaction.created",
  TRANSACTION_DELETED = "transaction.deleted",
  TRANSACTION_UPDATED = "transaction.updated",
}

export class TransactionCreatedEvent {
  constructor(public readonly transaction: TransactionDto) {}
}

export class TransactionDeletedEvent {
  constructor(public readonly transaction: TransactionDto) {}
}

export class TransactionUpdatedEvent {
  constructor(
    public readonly oldData: TransactionDto,
    public readonly newData: TransactionDto
  ) {}
}
