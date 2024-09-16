export const NODE_ENV = process.env.NODE_ENV;
export const VALID_ACCOUNTS = JSON.parse(
  process.env.VALID_ACCOUNTS || "{}"
) as Record<string, string>;
export const RATE_LIMIT_ENABLED = process.env.RATE_LIMIT_ENABLED === "true";
export const CRON_SECRET = process.env.CRON_SECRET;

export const FIREBASE_SERVICE_ACCOUNT = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT || "{}"
);
export const NEXT_PUBLIC_FIREBASE_APP_CONFIG = JSON.parse(
  process.env.NEXT_PUBLIC_FIREBASE_APP_CONFIG || "{}"
);

export const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
export const GEMINI_MODEL_NAME = process.env.GEMINI_MODEL_NAME || "";
export const PROMPT_TEMPLATE = (process.env.PROMPT_TEMPLATE || "").replace(
  /\\"/g,
  '"'
);

export const isDev = ["development", "local"].includes(NODE_ENV);
export const isServer = typeof window === "undefined";

// Client env variables are only available in the client
if (!isServer) {
  (self as any).NEXT_PUBLIC_FIREBASE_APP_CONFIG = JSON.parse(
    process.env.NEXT_PUBLIC_FIREBASE_APP_CONFIG || "{}"
  );
}
