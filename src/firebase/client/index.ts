"use client";

import { Env } from "@/config/env";
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

const alreadyCreatedAps = getApps();
if (alreadyCreatedAps.length === 0) {
  // Initialize Firebase
  initializeApp(Env.NEXT_PUBLIC_FIREBASE_APP_CONFIG);
}

export const firebaseApp = getApp();
