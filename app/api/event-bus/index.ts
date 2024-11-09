import EventEmitter from "node:events";

export const apiEventBus = new EventEmitter();

export enum EventTypes {
  TRANSACTION_CREATED = "transaction:created",
  TRANSACTION_DELETED = "transaction:deleted",
}
