import { createDefaultPreset } from "ts-jest";

const tsJestTransformCfg = createDefaultPreset({
  tsconfig: {
    emitDecoratorMetadata: true,
    experimentalDecorators: true,
  },
}).transform;

/** @type {import("jest").Config} **/
export const testEnvironment = "node";

const config = {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testPathIgnorePatterns: ["/__tests__/fixtures/"],
};

export default config;
