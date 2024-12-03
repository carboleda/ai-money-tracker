import { getFirestore } from "firebase-admin/firestore";
import { Env } from "@/config/env";

const suffix = Env.COLLECTION_SUFFIX && `-${Env.COLLECTION_SUFFIX}`;

export const Collections = {
  Users: `users${suffix}`,
  Accounts: `accounts${suffix}`,
  Transactions: `transactions${suffix}`,
  RecurringExpenses: `recurring-expenses${suffix}`,
} as const;

const db = getFirestore();

export { db };
