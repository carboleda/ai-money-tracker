type EventHandler<T = unknown> = (data: T) => void | Promise<void>;

export class PubSub {
  private static instance: PubSub;
  private subscribers: Map<string, Set<EventHandler<unknown>>> = new Map();

  private constructor() {}

  static getInstance(): PubSub {
    if (!PubSub.instance) {
      PubSub.instance = new PubSub();
    }
    return PubSub.instance;
  }

  subscribe<T = unknown>(event: string, handler: EventHandler<T>): () => void {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, new Set());
    }

    this.subscribers.get(event)!.add(handler as EventHandler<unknown>);

    // Return unsubscribe function
    return () => {
      const handlers = this.subscribers.get(event);
      if (handlers) {
        handlers.delete(handler as EventHandler<unknown>);
        if (handlers.size === 0) {
          this.subscribers.delete(event);
        }
      }
    };
  }

  async emit<T = unknown>(event: string, data: T): Promise<void> {
    const handlers = this.subscribers.get(event);
    if (!handlers || handlers.size === 0) {
      return;
    }

    const promises = Array.from(handlers).map((handler) =>
      Promise.resolve(handler(data))
    );

    await Promise.all(promises);
  }

  unsubscribeAll(event?: string): void {
    if (event) {
      this.subscribers.delete(event);
    } else {
      this.subscribers.clear();
    }
  }
}

export const pubsub = PubSub.getInstance();
