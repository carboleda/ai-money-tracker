export const VALID_ACCOUNTS = JSON.parse(process.env.VALID_ACCOUNTS || "{}");

export const FIREBASE_SERVICE_ACCOUNT = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT || "{}"
);

export const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
export const GEMINI_MODEL_NAME = process.env.GEMINI_MODEL_NAME || "";
export const PROMPT_TEMPLATE = (process.env.PROMPT_TEMPLATE || "").replace(
  /\\"/g,
  '"'
);
