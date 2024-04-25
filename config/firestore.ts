import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import * as env from "./env";

if (!getApps().length) {
  initializeApp({
    credential: cert(env.FIREBASE_SERVICE_ACCOUNT),
  });
}

export const db = getFirestore();
