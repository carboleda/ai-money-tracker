import { ValidAccount } from "@/interfaces/account";

export class Env {
  // General environment variables
  static readonly ENV_NAME = process.env.ENV_NAME;
  static readonly USER_ID_SEED = Number.parseInt(process.env.USER_ID_SEED!);
  static readonly VALID_ACCOUNTS = JSON.parse(
    process.env.NEXT_PUBLIC_VALID_ACCOUNTS || "{}"
  ) as Record<string, ValidAccount>;
  static readonly RATE_LIMIT_ENABLED =
    process.env.RATE_LIMIT_ENABLED === "true";
  static readonly CRON_SECRET = process.env.CRON_SECRET;
  static readonly EARLY_REMINDER_DAYS_AHEAD = Number.parseInt(
    process.env.EARLY_REMINDER_DAYS_AHEAD || "1"
  );
  static readonly RUN_ON_DAY_OF_MONTH = Number.parseInt(
    process.env.RUN_ON_DAY_OF_MONTH || "2"
  );
  static readonly FIREBASE_SERVICE_ACCOUNT = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT || "{}"
  ) as Record<string, string>;
  static readonly AUTH_COOKIE_SIGNATURE_KEYS = JSON.parse(
    process.env.AUTH_COOKIE_SIGNATURE_KEYS || "[]"
  );
  static readonly COLLECTION_SUFFIX = process.env.COLLECTION_SUFFIX || "";

  // Gemini environment variables
  static readonly GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
  static readonly GEMINI_MODEL_NAME = process.env.GEMINI_MODEL_NAME || "";
  static readonly PROMPT_TEMPLATE = (
    process.env.PROMPT_TEMPLATE || ""
  ).replaceAll('\\"', '"');

  // Public environment variables
  static readonly NEXT_PUBLIC_FIXED_MONTH =
    process.env.NEXT_PUBLIC_FIXED_MONTH || "2024-10-15";
  static readonly NEXT_PUBLIC_FIREBASE_APP_CONFIG = JSON.parse(
    process.env.NEXT_PUBLIC_FIREBASE_APP_CONFIG || "{}"
  ) as Record<string, string>;
  static readonly NEXT_PUBLIC_FIREBASE_VAPID_KEY =
    process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || "";

  static readonly isLocal = Env.ENV_NAME === "local";
  static readonly isServer = typeof globalThis.window === "undefined";

  private constructor() {}
}
