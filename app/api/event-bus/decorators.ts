import { EventBus, EventTypes } from ".";

export function OnEvent(name: EventTypes) {
  return function (
    _target: any,
    _methodName: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    // apiEventBus.on(name, originalMethod);
    EventBus.subscribe(name, originalMethod);

    return descriptor;
  };
}
