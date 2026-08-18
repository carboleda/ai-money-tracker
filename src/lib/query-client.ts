import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      // true will refetch on reconnect if the query is stale, "false" will not, and "always" will always refetch on reconnect
      refetchOnReconnect: true,
      retry: 1,
      staleTime: 60 * 1000,
      gcTime: 24 * 60 * 60 * 1000,
    },
  },
});
