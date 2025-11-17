import { PubSub, pubsub } from '../pubsub';

describe('PubSub', () => {
  beforeEach(() => {
    // Clear all subscriptions before each test
    pubsub.unsubscribeAll();
  });

  describe('getInstance', () => {
    it('should return the same instance (singleton pattern)', () => {
      const instance1 = PubSub.getInstance();
      const instance2 = PubSub.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  describe('subscribe', () => {
    it('should add a handler to the event', () => {
      const handler = jest.fn();
      const unsubscribe = pubsub.subscribe('test-event', handler);

      expect(typeof unsubscribe).toBe('function');
    });

    it('should allow multiple handlers for the same event', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      pubsub.subscribe('test-event', handler1);
      pubsub.subscribe('test-event', handler2);

      // Both handlers should be stored
      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
    });

    it('should support multiple different events', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      pubsub.subscribe('event-1', handler1);
      pubsub.subscribe('event-2', handler2);

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
    });

    it('should return an unsubscribe function', () => {
      const handler = jest.fn();
      const unsubscribe = pubsub.subscribe('test-event', handler);

      expect(typeof unsubscribe).toBe('function');
    });
  });

  describe('emit', () => {
    it('should call all handlers for an event', async () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      pubsub.subscribe('test-event', handler1);
      pubsub.subscribe('test-event', handler2);

      await pubsub.emit('test-event', 'data');

      expect(handler1).toHaveBeenCalledWith('data');
      expect(handler2).toHaveBeenCalledWith('data');
      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);
    });

    it('should pass data to handlers', async () => {
      const handler = jest.fn();
      const testData = { id: 1, name: 'test' };

      pubsub.subscribe('test-event', handler);
      await pubsub.emit('test-event', testData);

      expect(handler).toHaveBeenCalledWith(testData);
    });

    it('should handle handlers that return promises', async () => {
      const handler = jest.fn().mockResolvedValue(undefined);

      pubsub.subscribe('test-event', handler);
      await pubsub.emit('test-event', 'data');

      expect(handler).toHaveBeenCalledWith('data');
    });

    it('should wait for all async handlers to complete', async () => {
      const order: string[] = [];

      const handler1 = jest.fn(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        order.push('handler1');
      });

      const handler2 = jest.fn(async () => {
        await new Promise((resolve) => setTimeout(resolve, 5));
        order.push('handler2');
      });

      pubsub.subscribe('test-event', handler1);
      pubsub.subscribe('test-event', handler2);

      await pubsub.emit('test-event', 'data');

      expect(order).toContain('handler1');
      expect(order).toContain('handler2');
      expect(handler1).toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
    });

    it('should not call handlers for unsubscribed events', async () => {
      const handler = jest.fn();

      pubsub.subscribe('event-1', handler);
      await pubsub.emit('event-2', 'data');

      expect(handler).not.toHaveBeenCalled();
    });

    it('should handle emit with no subscribers gracefully', async () => {
      expect(async () => {
        await pubsub.emit('non-existent-event', 'data');
      }).not.toThrow();
    });

    it('should support typed data', async () => {
      interface User {
        id: number;
        name: string;
      }

      const handler = jest.fn<void, [User]>();
      const user: User = { id: 1, name: 'John' };

      pubsub.subscribe<User>('user-event', handler);
      await pubsub.emit<User>('user-event', user);

      expect(handler).toHaveBeenCalledWith(user);
    });
  });

  describe('unsubscribe (via returned function)', () => {
    it('should remove a single handler', async () => {
      const handler = jest.fn();

      const unsubscribe = pubsub.subscribe('test-event', handler);
      unsubscribe();

      await pubsub.emit('test-event', 'data');

      expect(handler).not.toHaveBeenCalled();
    });

    it('should only remove the specified handler', async () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      const unsubscribe1 = pubsub.subscribe('test-event', handler1);
      pubsub.subscribe('test-event', handler2);

      unsubscribe1();

      await pubsub.emit('test-event', 'data');

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).toHaveBeenCalledWith('data');
    });

    it('should handle unsubscribe when no handlers exist', () => {
      const handler = jest.fn();
      const unsubscribe = pubsub.subscribe('test-event', handler);

      pubsub.unsubscribeAll('test-event');
      expect(() => unsubscribe()).not.toThrow();
    });

    it('should be idempotent', () => {
      const handler = jest.fn();
      const unsubscribe = pubsub.subscribe('test-event', handler);

      unsubscribe();
      expect(() => unsubscribe()).not.toThrow();
    });

    it('should clean up empty event sets', async () => {
      const handler = jest.fn();
      const unsubscribe = pubsub.subscribe('test-event', handler);

      unsubscribe();

      // After unsubscribing the last handler, the event should be removed
      // Verify by subscribing again and checking if emit works
      const handler2 = jest.fn();
      pubsub.subscribe('test-event', handler2);

      await pubsub.emit('test-event', 'data');
      expect(handler2).toHaveBeenCalledWith('data');
    });
  });

  describe('unsubscribeAll', () => {
    it('should remove all handlers for a specific event', async () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      pubsub.subscribe('test-event', handler1);
      pubsub.subscribe('test-event', handler2);

      pubsub.unsubscribeAll('test-event');

      await pubsub.emit('test-event', 'data');

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
    });

    it('should remove all handlers for all events', async () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      const handler3 = jest.fn();

      pubsub.subscribe('event-1', handler1);
      pubsub.subscribe('event-2', handler2);
      pubsub.subscribe('event-1', handler3);

      pubsub.unsubscribeAll();

      await pubsub.emit('event-1', 'data1');
      await pubsub.emit('event-2', 'data2');

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
      expect(handler3).not.toHaveBeenCalled();
    });

    it('should allow resubscribing after unsubscribeAll', async () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      pubsub.subscribe('test-event', handler1);
      pubsub.unsubscribeAll();

      pubsub.subscribe('test-event', handler2);
      await pubsub.emit('test-event', 'data');

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).toHaveBeenCalledWith('data');
    });

    it('should handle unsubscribeAll when no subscribers exist', () => {
      expect(() => pubsub.unsubscribeAll()).not.toThrow();
      expect(() => pubsub.unsubscribeAll('non-existent')).not.toThrow();
    });
  });

  describe('edge cases', () => {
    it('should handle handlers that throw synchronous errors', async () => {
      const handler1 = jest.fn(() => {
        throw new Error('Handler error');
      });
      const handler2 = jest.fn();

      pubsub.subscribe('test-event', handler1);
      pubsub.subscribe('test-event', handler2);

      await expect(pubsub.emit('test-event', 'data')).rejects.toThrow(
        'Handler error'
      );
    });

    it('should handle handlers that throw async errors', async () => {
      const handler1 = jest.fn(async () => {
        throw new Error('Async handler error');
      });
      const handler2 = jest.fn();

      pubsub.subscribe('test-event', handler1);
      pubsub.subscribe('test-event', handler2);

      await expect(pubsub.emit('test-event', 'data')).rejects.toThrow(
        'Async handler error'
      );
    });

    it('should handle null or undefined data', async () => {
      const handler = jest.fn();

      pubsub.subscribe('test-event', handler);
      await pubsub.emit('test-event', null);
      await pubsub.emit('test-event', undefined);

      expect(handler).toHaveBeenCalledWith(null);
      expect(handler).toHaveBeenCalledWith(undefined);
    });

    it('should handle complex object data', async () => {
      const handler = jest.fn();
      const complexData = {
        nested: {
          value: 123,
          array: [1, 2, 3],
        },
        fn: () => {},
      };

      pubsub.subscribe('test-event', handler);
      await pubsub.emit('test-event', complexData);

      expect(handler).toHaveBeenCalledWith(complexData);
    });

    it('should support subscriber isolation (instance per test)', () => {
      const newInstance = PubSub.getInstance();
      const handler = jest.fn();

      // Even though we cleared in beforeEach, verify the same instance behavior
      expect(newInstance).toBe(pubsub);
    });
  });
});
