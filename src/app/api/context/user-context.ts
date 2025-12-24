import { Env } from "@/config/env";
import { AsyncLocalStorage } from "node:async_hooks";
import * as XXH from "xxhashjs";

const asyncLocalStorage = new AsyncLocalStorage<UserContext>();

function generateUserId(email: string): string {
  return XXH.h64(email, Env.USER_ID_SEED).toString(32);
}

export interface UserContext {
  id: string;
  email: string;
}

export class UserContextData implements UserContext {
  constructor(
    private readonly asyncLocalStorage: AsyncLocalStorage<UserContext>
  ) {}

  private get context() {
    const context = this.asyncLocalStorage.getStore();

    if (!context) {
      throw new Error(
        "User context not initialized. Ensure route handler is wrapped with withUserContext()."
      );
    }

    return context;
  }

  get id(): string {
    return this.context.id;
  }

  get email(): string {
    return this.context.email;
  }
}

export function getUserContext(): UserContext {
  return new UserContextData(asyncLocalStorage);
}

export function getUserId(): string {
  return getUserContext().id;
}

export function runWithUserContext<T>(email: string, callback: () => T): T {
  return asyncLocalStorage.run({ id: generateUserId(email), email }, callback);
}

export { asyncLocalStorage };
