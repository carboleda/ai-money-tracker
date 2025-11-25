import { EventEmitter } from "node:events";

type EventHandler<T = unknown> = (data: T) => void | Promise<void>;

export class PubSub {
  private static instance: PubSub;
  private readonly emitter: EventEmitter;

  private constructor() {
    this.emitter = new EventEmitter();
  }

  static getInstance(): PubSub {
    if (!PubSub.instance) {
      PubSub.instance = new PubSub();
    }
    return PubSub.instance;
  }

  subscribe<T = unknown>(event: string, handler: EventHandler<T>): () => void {
    const wrappedHandler = (data: T) => handler(data);
    this.emitter.on(event, wrappedHandler);

    // Return unsubscribe function
    return () => {
      this.emitter.off(event, wrappedHandler);
    };
  }

  async emit<T = unknown>(event: string, data: T): Promise<void> {
    const listeners = this.emitter.listeners(event);
    if (listeners.length === 0) {
      return;
    }

    const promises = listeners.map((listener) =>
      Promise.resolve((listener as EventHandler<T>)(data))
    );

    await Promise.all(promises);
  }

  unsubscribeAll(event?: string): void {
    if (event) {
      this.emitter.removeAllListeners(event);
    } else {
      this.emitter.removeAllListeners();
    }
  }
}

export const pubsub = PubSub.getInstance();
