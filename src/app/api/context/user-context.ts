import { AsyncLocalStorage } from "node:async_hooks";
import * as XXH from "xxhashjs";

export interface UserContext {
  id: string;
  email: string;
}

const asyncLocalStorage = new AsyncLocalStorage<UserContext>();

export function getUserContext(): UserContext {
  const context = asyncLocalStorage.getStore();

  if (!context?.email) {
    throw new Error(
      "User context not initialized. Ensure route handler is wrapped with withUserContext()."
    );
  }

  return context;
}

export function runWithUserContext<T>(email: string, callback: () => T): T {
  const id = XXH.h64(email, 0xcafebabe).toString(32);
  const userContext: UserContext = { id, email };
  return asyncLocalStorage.run(userContext, callback);
}

export { asyncLocalStorage };
