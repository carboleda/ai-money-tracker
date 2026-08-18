"use client";

import "@/firebase/client";
import * as React from "react";
import { HeroUIProvider } from "@heroui/system";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { Query } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { ToastProvider } from "@heroui/toast";
import TranslationsProvider from "@/components/providers/TranslationsProvider";
import { AccountsProvider } from "@/components/providers/AccountsProvider";
import { CategoriesProvider } from "@/components/providers/CategoriesProvider";
import { queryClient } from "@/lib/query-client";
import { indexedDbPersister } from "@/lib/query-persister";
import { ServiceWorkerRegistrar } from "@/components/providers/ServiceWorkerRegistrar";

export interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: Readonly<ProvidersProps>) {
  const router = useRouter();

  return (
    <HeroUIProvider navigate={router.push}>
      <ToastProvider toastOffset={40} />
      <NextThemesProvider attribute="class" defaultTheme="dark">
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{
            persister: indexedDbPersister,
            // Default persistence only dehydrates status === "success"
            // queries. A failed background refetch while offline flips a
            // previously-successful query to "error" (react-query keeps its
            // last-good `data` in memory either way), which would otherwise
            // drop that query from the next persisted snapshot — erasing
            // offline-usable data instead of only replacing it on a real
            // successful fetch.
            dehydrateOptions: {
              shouldDehydrateQuery: (query: Query) =>
                query.state.data !== undefined,
            },
          }}
        >
          <ServiceWorkerRegistrar />
          <TranslationsProvider>
            <AccountsProvider>
              <CategoriesProvider>{children}</CategoriesProvider>
            </AccountsProvider>
          </TranslationsProvider>
        </PersistQueryClientProvider>
      </NextThemesProvider>
    </HeroUIProvider>
  );
}
