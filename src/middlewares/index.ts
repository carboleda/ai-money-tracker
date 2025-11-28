import { authenticationMiddleware } from "./authentication";
import { authorizatonMiddleware } from "./authorization";
import { cronjobSecretMiddleware } from "./cronjobSecret";
import { ratelimitMiddleware } from "./ratelimit";

export const middlewareChain = [
  ratelimitMiddleware,
  cronjobSecretMiddleware,
  authorizatonMiddleware,
  authenticationMiddleware,
];
