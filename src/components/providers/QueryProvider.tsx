"use client";

import { PropsWithChildren, useEffect, useRef } from "react";
import type { Query } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { queryClient } from "@/lib/query-client";
import { indexedDbPersister } from "@/lib/query-persister";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

// Default persistence only dehydrates status === "success" queries. A failed
// background refetch while offline flips a previously-successful query to
// "error" (react-query keeps its last-good `data` in memory either way),
// which would otherwise drop that query from the next persisted snapshot —
// erasing offline-usable data instead of only replacing it on a real
// successful fetch.
const shouldDehydrateQuery = (query: Query) => query.state.data !== undefined;

export function QueryProvider({ children }: Readonly<PropsWithChildren>) {
  useRefetchOnReconnect();

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: indexedDbPersister,
        dehydrateOptions: { shouldDehydrateQuery },
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}

// A query that fails while offline settles into status "error" rather than
// staying paused, so react-query's own on-reconnect resume never picks it
// back up — it just sits there until something remounts it. This forces
// every query to retry the moment the browser reports being back online,
// instead of waiting for the user to navigate again or reload the page.
function useRefetchOnReconnect() {
  const { isOnline } = useOnlineStatus();
  const wasOnline = useRef(isOnline);

  useEffect(() => {
    if (isOnline && !wasOnline.current) {
      queryClient.invalidateQueries();
    }
    wasOnline.current = isOnline;
  }, [isOnline]);
}
