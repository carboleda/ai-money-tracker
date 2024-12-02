import { getFirestore } from "firebase-admin/firestore";
import { Env } from "@/config/env";

const suffix = Env.isDev ? "-dev" : "";

export const Collections = {
  Users: `users${suffix}`,
  Accounts: `accounts${suffix}`,
  Transactions: `transactions${suffix}`,
  RecurringExpenses: `recurringExpenses${suffix}`,
} as const;

const db = getFirestore();

export { db };
