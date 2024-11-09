import { apiEventBus } from ".";

export function OnEvent(name: string) {
  return function (
    _target: any,
    _methodName: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    apiEventBus.on(name, originalMethod);

    return descriptor;
  };
}
