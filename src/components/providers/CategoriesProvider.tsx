"use client";

import React from "react";
import { useCategoriesLoader } from "@/hooks/useCategoriesLoader";

/**
 * Provider component that loads categories on app initialization
 *
 * This wraps the app and ensures categories are fetched once and available
 * globally via the Zustand store. The hook handles syncing between
 * SWR's cache and the store.
 */
export function CategoriesProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // This hook runs on mount and keeps the store in sync with SWR cache
  useCategoriesLoader();

  return <>{children}</>;
}
