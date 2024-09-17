import { getFirestore } from "firebase-admin/firestore";

export enum Collections {
  Users = "users",
  Transactions = "transactions",
  RecurringExpenses = "recurring-expenses",
}

export const db = getFirestore();
