import { authenticationMiddleware } from "./authentication";
import { authorizatonMiddleware } from "./authorization";
import { cronjobSecretMiddleware } from "./cronjobSecret";
import { ratelimitMiddleware } from "./ratelimit";
import { webhookSecretMiddleware } from "./webhookSecret";

export const middlewareChain = [
  ratelimitMiddleware,
  cronjobSecretMiddleware,
  webhookSecretMiddleware,
  authorizatonMiddleware,
  authenticationMiddleware,
];
