import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAccountStore } from "@/stores/useAccountStore";
import { GetAccountsResponse } from "@/interfaces/account";
import { fetchJson } from "@/config/request";

const KEY = "/api/account";

/**
 * Hook that fetches accounts using TanStack Query and syncs them to Zustand store
 *
 * Benefits:
 * - TanStack Query handles caching, revalidation, deduplication, and offline persistence
 * - Zustand provides global state for non-hook components
 */
export function useAccountsLoader() {
  const setAccounts = useAccountStore((state) => state.setAccounts);
  const setIsLoading = useAccountStore((state) => state.setIsLoading);
  const setError = useAccountStore((state) => state.setError);

  const { data, error, isLoading } = useQuery<GetAccountsResponse>({
    queryKey: [KEY],
    queryFn: () => fetchJson<GetAccountsResponse>(KEY),
  });

  // Sync query data to Zustand store whenever it changes
  useEffect(() => {
    if (data) {
      setAccounts(data.accounts || []);
      setError(null);
    }
  }, [data, setAccounts, setError]);

  // Sync loading state to Zustand
  useEffect(() => {
    setIsLoading(isLoading);
  }, [isLoading, setIsLoading]);

  // Sync error state to Zustand
  useEffect(() => {
    if (error) {
      setError(
        error instanceof Error ? error.message : "Failed to fetch accounts"
      );
    }
  }, [error, setError]);

  return { data, error, isLoading };
}
