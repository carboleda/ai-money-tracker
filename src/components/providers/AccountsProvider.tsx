"use client";

import React from "react";
import { useAccountsLoader } from "@/hooks/useAccountsLoader";

/**
 * Provider component that loads accounts on app initialization
 *
 * This wraps the app and ensures accounts are fetched once and available
 * globally via the Zustand store. The hook handles syncing between
 * SWR's cache and the store.
 */
export function AccountsProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // This hook runs on mount and keeps the store in sync with SWR cache
  useAccountsLoader();

  return <>{children}</>;
}
