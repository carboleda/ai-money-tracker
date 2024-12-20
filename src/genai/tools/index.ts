import { FunctionDeclaration, Tool } from "@google/generative-ai";
import createTransaction from "./createTransaction";
import invalidTransaction from "./invalidTransaction";

export const tools: Tool[] = [
  {
    functionDeclarations: [
      createTransaction,
      invalidTransaction,
    ] as FunctionDeclaration[],
  },
];
