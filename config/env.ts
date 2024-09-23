export class Env {
  static NODE_ENV = process.env.NODE_ENV;
  static VALID_ACCOUNTS = JSON.parse(
    process.env.VALID_ACCOUNTS || "{}"
  ) as Record<string, string>;
  static RATE_LIMIT_ENABLED = process.env.RATE_LIMIT_ENABLED === "true";
  static CRON_SECRET = process.env.CRON_SECRET;
  static EARLY_REMINDER_DAYS_AHEAD = parseInt(
    process.env.EARLY_REMINDER_DAYS_AHEAD || "1"
  );

  static FIREBASE_SERVICE_ACCOUNT = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT || "{}"
  ) as Record<string, string>;
  static NEXT_PUBLIC_FIREBASE_APP_CONFIG = JSON.parse(
    process.env.NEXT_PUBLIC_FIREBASE_APP_CONFIG || "{}"
  ) as Record<string, string>;
  static NEXT_PUBLIC_FIREBASE_VAPID_KEY =
    process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || "";

  static GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
  static GEMINI_MODEL_NAME = process.env.GEMINI_MODEL_NAME || "";
  static PROMPT_TEMPLATE = (process.env.PROMPT_TEMPLATE || "").replace(
    /\\"/g,
    '"'
  );

  static isDev = ["development", "local"].includes(Env.NODE_ENV);
  static isServer = typeof window === "undefined";

  private constructor() {}
}
