import { EventBus, EventTypes, EventCallback } from ".";

export function OnEvent<T>(name: EventTypes) {
  return function (
    _target: any,
    _methodName: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value as EventCallback<T>;

    EventBus.subscribe(name, originalMethod);

    return descriptor;
  };
}
