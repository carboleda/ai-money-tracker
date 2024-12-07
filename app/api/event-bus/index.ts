import PubSub from "pubsub-js";

export enum EventTypes {
  TRANSACTION_CREATED = "transaction:created",
  TRANSACTION_DELETED = "transaction:deleted",
  TRANSACTION_UPDATED = "transaction:updated",
}

export type SingleParamEvent<T> = T;

export interface UpdateEvent<T> {
  oldData: T;
  newData: T;
}

export type Data<T> = SingleParamEvent<T> | UpdateEvent<T>;

export type EventCallback<T> = (data: Data<T>) => void;

export class EventBus {
  static async publish<T>(
    event: EventTypes,
    data: SingleParamEvent<T> | UpdateEvent<T>
  ) {
    console.log("EventBus.publish", { event, data });
    return PubSub.publishSync(event, data);
  }

  static subscribe<T>(event: EventTypes, callback: EventCallback<T>) {
    return PubSub.subscribe(event, (_: string, data: Data<T>) => {
      callback(data);
    });
  }
}
