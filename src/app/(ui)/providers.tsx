"use client";

import "@/firebase/client";
import * as React from "react";
import { HeroUIProvider } from "@heroui/system";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ToastProvider } from "@heroui/toast";
import TranslationsProvider from "@/components/providers/TranslationsProvider";
import { AccountsProvider } from "@/components/providers/AccountsProvider";
import { CategoriesProvider } from "@/components/providers/CategoriesProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
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
        <QueryProvider>
          <ServiceWorkerRegistrar />
          <TranslationsProvider>
            <AccountsProvider>
              <CategoriesProvider>{children}</CategoriesProvider>
            </AccountsProvider>
          </TranslationsProvider>
        </QueryProvider>
      </NextThemesProvider>
    </HeroUIProvider>
  );
}
