import { useEffect } from "react";
import { useGetUser } from "@/hooks/useGetUser";
import { useUserSettingsStore } from "@/stores/useUserSettingsStore";

/**
 * Hook that syncs the authenticated user's settings (sourced from the
 * already-deduped useGetUser query) into the Zustand store, so any other
 * component can read settings without re-subscribing to the whole user query.
 */
export function useUserSettingsLoader() {
  const { user, isLoading } = useGetUser();
  const setSettings = useUserSettingsStore((state) => state.setSettings);
  const setIsLoading = useUserSettingsStore((state) => state.setIsLoading);

  useEffect(() => {
    setSettings(user?.settings);
  }, [user?.settings, setSettings]);

  useEffect(() => {
    setIsLoading(isLoading);
  }, [isLoading, setIsLoading]);
}
