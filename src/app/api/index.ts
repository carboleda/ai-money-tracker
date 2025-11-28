import "reflect-metadata";
import { container } from "tsyringe";
import { DomainModule } from "./domain/domain.module";
import { DriversModule } from "./drivers/drivers.module";

let isInitialized = false;

function ensureInitialized() {
  if (!isInitialized) {
    // Initialize all modules (Firebase must be initialized first via instrumentation.ts)
    DriversModule.register();
    DomainModule.register();
    isInitialized = true;
  }
}

// Export the container for use in route handlers with lazy initialization
export const api = new Proxy(container, {
  get(target, prop) {
    ensureInitialized();
    return target[prop as keyof typeof container];
  },
});
