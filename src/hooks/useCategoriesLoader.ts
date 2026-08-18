import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useCategoryStore } from "@/stores/useCategoryStore";
import { GetCategoriesResponse } from "@/interfaces/category";
import { fetchJson } from "@/config/request";

const KEY = "/api/category";

/**
 * Hook that fetches categories using TanStack Query and syncs them to Zustand store
 *
 * Benefits:
 * - TanStack Query handles caching, revalidation, deduplication, and offline persistence
 * - Zustand provides global state for non-hook components
 */
export function useCategoriesLoader() {
  const setCategories = useCategoryStore((state) => state.setCategories);
  const setIsLoading = useCategoryStore((state) => state.setIsLoading);
  const setError = useCategoryStore((state) => state.setError);

  const { data, error, isLoading } = useQuery<GetCategoriesResponse>({
    queryKey: [KEY],
    queryFn: () => fetchJson<GetCategoriesResponse>(KEY),
  });

  // Sync query data to Zustand store whenever it changes
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
