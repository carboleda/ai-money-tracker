import useSWR from "swr";
import { useEffect } from "react";
import { useAccountStore } from "@/stores/useAccountStore";
import { AccountModel } from "@/app/api/domain/account/model/account.model";

/**
 * Hook that fetches accounts using SWR and syncs them to Zustand store
 *
 * Benefits:
 * - SWR handles caching, revalidation, and deduplication
 * - Zustand provides global state for non-hook components
 * - Automatic background updates when browser regains focus
 */
export function useAccountsLoader() {
  const setAccounts = useAccountStore((state) => state.setAccounts);
  const setIsLoading = useAccountStore((state) => state.setIsLoading);
  const setError = useAccountStore((state) => state.setError);

  // SWR handles the actual fetching with built-in caching and revalidation
  const { data, error, isLoading } = useSWR<{
    accounts: AccountModel[];
  }>("/api/account");

  // Sync SWR data to Zustand store whenever it changes
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
