import { inject, injectable, InjectionToken } from "tsyringe";
import { pubsub } from "@/app/api/helpers/pubsub";
import { getUserId } from "@/app/api/context/user-context";
import { Env } from "@/config/env";

const EVENT_HANDLERS_METADATA = Symbol("eventHandlers");
const USER_ID_TOKEN = Symbol("USER_ID");

// Create a symbol-based registry to map models to unique tokens
// This prevents minification issues since symbols are always unique
const tokenRegistry = new Map<any, symbol>();

export function getRepositoryToken<R>(
  model: new (...args: never[]) => R
): InjectionToken {
  // Check if we already created a token for this model
  if (!tokenRegistry.has(model)) {
    // Create a unique symbol for this model - symbols are never minified
    tokenRegistry.set(model, Symbol(`${model.name}_Repository`));
  }
  return tokenRegistry.get(model)!;
}

export function InjectRepository<R>(
  model: new (...args: never[]) => R
): ParameterDecorator {
  return inject(getRepositoryToken(model));
}

export function Injectable() {
  return injectable();
}

export function Inject(token: InjectionToken): ParameterDecorator {
  return inject(token);
}

interface EventHandlerMetadata {
  event: string;
  methodName: string | symbol;
}

export function OnEvent(event: string): MethodDecorator {
  return (target: object, propertyKey: string | symbol) => {
    const existingHandlers =
      Reflect.getMetadata(EVENT_HANDLERS_METADATA, target.constructor) || [];
    const handlers: EventHandlerMetadata[] = [
      ...existingHandlers,
      { event, methodName: propertyKey },
    ];
    Reflect.defineMetadata(
      EVENT_HANDLERS_METADATA,
      handlers,
      target.constructor
    );
  };
}

export function registerEventHandlers(instance: object): void {
  const constructor = instance.constructor;
  const handlers: EventHandlerMetadata[] =
    Reflect.getMetadata(EVENT_HANDLERS_METADATA, constructor) || [];

  handlers.forEach(({ event, methodName }) => {
    const method = (instance as Record<string | symbol, unknown>)[methodName];
    if (typeof method === "function") {
      pubsub.subscribe(event, method.bind(instance));
    }
  });
}

export function InjectUserId(): ParameterDecorator {
  return inject(USER_ID_TOKEN);
}

export function getUserIdToken() {
  return USER_ID_TOKEN;
}
