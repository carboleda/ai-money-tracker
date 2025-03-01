export class Env {
  // General environment variables
  static ENV_NAME = process.env.ENV_NAME;
  static VALID_ACCOUNTS = JSON.parse(
    process.env.NEXT_PUBLIC_VALID_ACCOUNTS || "{}"
  ) as Record<string, any>;
  static RATE_LIMIT_ENABLED = process.env.RATE_LIMIT_ENABLED === "true";
  static CRON_SECRET = process.env.CRON_SECRET;
  static EARLY_REMINDER_DAYS_AHEAD = parseInt(
    process.env.EARLY_REMINDER_DAYS_AHEAD || "1"
  );
  static FIREBASE_SERVICE_ACCOUNT = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT || "{}"
  ) as Record<string, string>;
  static AUTH_COOKIE_SIGNATURE_KEYS = JSON.parse(
    process.env.AUTH_COOKIE_SIGNATURE_KEYS || "[]"
  );
  static COLLECTION_SUFFIX = process.env.COLLECTION_SUFFIX || "";

  // Gemini environment variables
  static GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
  static GEMINI_MODEL_NAME = process.env.GEMINI_MODEL_NAME || "";
  static PROMPT_TEMPLATE = (process.env.PROMPT_TEMPLATE || "").replace(
    /\\"/g,
    '"'
  );

  // Public environment variables
  static NEXT_PUBLIC_FIXED_MONTH =
    process.env.NEXT_PUBLIC_FIXED_MONTH || "2024-10-15";
  static NEXT_PUBLIC_FIREBASE_APP_CONFIG = JSON.parse(
    process.env.NEXT_PUBLIC_FIREBASE_APP_CONFIG || "{}"
  ) as Record<string, string>;
  static NEXT_PUBLIC_FIREBASE_VAPID_KEY =
    process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || "";

  static isLocal = Env.ENV_NAME === "local";
  static isServer = typeof window === "undefined";

  private constructor() {}
}
