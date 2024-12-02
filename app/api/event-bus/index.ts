import PubSub from "pubsub-js";

export enum EventTypes {
  TRANSACTION_CREATED = "transaction:created",
  TRANSACTION_DELETED = "transaction:deleted",
}

export class EventBus {
  static async publish(event: EventTypes, data: any) {
    console.log("EventBus.publish", { event, data });
    PubSub.publishSync(event, data);
  }

  static subscribe(event: EventTypes, callback: (data: any) => void) {
    PubSub.subscribe(event, (_: string, data: any) => {
      callback(data);
    });
  }
}
