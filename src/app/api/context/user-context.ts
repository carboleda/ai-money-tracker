import { Env } from "@/config/env";
import { AsyncLocalStorage } from "node:async_hooks";

interface UserContext {
  userId: string;
}

const asyncLocalStorage = new AsyncLocalStorage<UserContext>();

export function getUserId(): string | undefined {
  const store = asyncLocalStorage.getStore();
  const userId = store?.userId;

  if (!userId) {
    // In local environment, use a default test user ID
    if (Env.isLocal) {
      return "local-test-user";
    }

    throw new Error(
      "User context not initialized. Ensure route handler is wrapped with withUserContext()."
    );
  }

  return userId;
}

export function setUserContext(userId: string): void {
  const store = asyncLocalStorage.getStore();
  if (store) {
    store.userId = userId;
  }
}

export function runWithUserContext<T>(userId: string, callback: () => T): T {
  return asyncLocalStorage.run({ userId }, callback);
}

export { asyncLocalStorage };
