"use client";

import React from "react";
import { useUserSettingsLoader } from "@/hooks/useUserSettingsLoader";

/**
 * Provider component that keeps the user-settings Zustand store in sync
 * with the authenticated user's settings, fetched once via useGetUser.
 */
export function UserSettingsProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  useUserSettingsLoader();

  return <>{children}</>;
}
