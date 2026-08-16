import useSWR from "swr";
import { useEffect } from "react";
import { useCategoryStore } from "@/stores/useCategoryStore";
import { GetCategoriesResponse } from "@/interfaces/category";

/**
 * Hook that fetches categories using SWR and syncs them to Zustand store
 *
 * Benefits:
 * - SWR handles caching, revalidation, and deduplication
 * - Zustand provides global state for non-hook components
 * - Automatic background updates when browser regains focus
 */
export function useCategoriesLoader() {
  const setCategories = useCategoryStore((state) => state.setCategories);
  const setIsLoading = useCategoryStore((state) => state.setIsLoading);
  const setError = useCategoryStore((state) => state.setError);

  // SWR handles the actual fetching with built-in caching and revalidation
  const { data, error, isLoading } =
    useSWR<GetCategoriesResponse>("/api/category");

  // Sync SWR data to Zustand store whenever it changes
  useEffect(() => {
    if (data) {
      setCategories(data.categories || []);
      setError(null);
    }
  }, [data, setCategories, setError]);

  // Sync loading state to Zustand
  useEffect(() => {
    setIsLoading(isLoading);
  }, [isLoading, setIsLoading]);

  // Sync error state to Zustand
  useEffect(() => {
    if (error) {
      setError(
        error instanceof Error ? error.message : "Failed to fetch categories"
      );
    }
  }, [error, setError]);

  return { data, error, isLoading };
}
