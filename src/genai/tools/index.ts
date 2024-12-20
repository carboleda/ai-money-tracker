import { FunctionDeclaration, Tool } from "@google/generative-ai";
import createTransaction from "./createTransaction.json";
import invalidTransaction from "./invalidTransaction.json";

export const tools: Tool[] = [
  {
    functionDeclarations: [
      createTransaction,
      invalidTransaction,
    ] as FunctionDeclaration[],
  },
];
