import { getFirestore } from "firebase-admin/firestore";

export enum Collections {
  Transactions = "transactions",
  RecurringExpenses = "recurring-expenses",
}

export const db = getFirestore();
