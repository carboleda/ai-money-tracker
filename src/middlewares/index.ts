import { authenticationMiddleware } from "./authentication";
import { authorizatonMiddleware } from "./authorization";
import { ratelimitMiddleware } from "./ratelimit";

export const middlewareChain = [
  ratelimitMiddleware,
  authorizatonMiddleware,
  authenticationMiddleware,
];
