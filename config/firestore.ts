import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import * as env from "./env";

const alreadyCreatedAps = getApps();

if (alreadyCreatedAps.length === 0) {
  initializeApp({
    credential: cert(env.FIREBASE_SERVICE_ACCOUNT),
  });
}

export const db = getFirestore();
