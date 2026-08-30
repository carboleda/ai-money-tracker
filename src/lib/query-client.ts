import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      // true will refetch on reconnect if the query is stale, "false" will not, and "always" will always refetch on reconnect
      refetchOnReconnect: true,
      retry: 1,
      // Mark data as stale immediately so it always checks for updates in the background
      staleTime: 0,
      // Keep the cached data in memory for 24 hours (or Infinity)
      // This ensures the cache is ALWAYS there to be served instantly!
      gcTime: 1000 * 60 * 60 * 24,
      // Make sure it pulls from cache even when offline
      networkMode: "offlineFirst",
    },
  },
});
