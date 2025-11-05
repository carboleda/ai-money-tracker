import { inject, injectable, InjectionToken } from "tsyringe";
import { pubsub } from "@/app/api/helpers/pubsub";

export function getRepositoryToken<R>(
  model: new (...args: never[]) => R
): string {
  return `${model.name}Repository`;
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

const EVENT_HANDLERS_METADATA = Symbol("eventHandlers");

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
