import { GoogleGenerativeAI } from "@google/generative-ai";
import { Env } from "./env";

const genAI = new GoogleGenerativeAI(Env.GEMINI_API_KEY);

export const genAIModel = genAI.getGenerativeModel({
  model: Env.GEMINI_MODEL_NAME,
  generationConfig: {
    temperature: 0,
    maxOutputTokens: 1024,
    topK: 40,
    topP: 0.95,
  },
});
