import { useUserSettingsStore } from "@/stores/useUserSettingsStore";

/**
 * Centralized read access to the authenticated user's settings. Backed by
 * useUserSettingsLoader/UserSettingsProvider, which keeps the store in sync
 * with useGetUser — components that only need settings should use this
 * instead of calling useGetUser() directly.
 */
export function useUserSettings() {
  return useUserSettingsStore((state) => state.settings);
}
