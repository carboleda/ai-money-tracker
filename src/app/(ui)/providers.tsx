"use client";

import "@/firebase/client";
import * as React from "react";
import { RouterProvider, Toast } from "@heroui/react";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import TranslationsProvider from "@/components/providers/TranslationsProvider";
import { AccountsProvider } from "@/components/providers/AccountsProvider";
import { CategoriesProvider } from "@/components/providers/CategoriesProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { ServiceWorkerRegistrar } from "@/components/providers/ServiceWorkerRegistrar";
import { ThemeCookieSync } from "@/components/providers/ThemeCookieSync";
import { OnlineStatusListener } from "@/components/providers/OnlineStatusListener";
import { AuthUserInfoProvider } from "@/components/providers/AuthUserInfoProvider";

export interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: Readonly<ProvidersProps>) {
  const router = useRouter();

  return (
    <RouterProvider navigate={router.push}>
      <Toast.Provider />
      <NextThemesProvider attribute="class" defaultTheme="dark">
        <ThemeCookieSync />
        <OnlineStatusListener />
        <AuthUserInfoProvider />
        <QueryProvider>
          <ServiceWorkerRegistrar />
          <TranslationsProvider>
            <AccountsProvider>
              <CategoriesProvider>{children}</CategoriesProvider>
            </AccountsProvider>
          </TranslationsProvider>
        </QueryProvider>
      </NextThemesProvider>
    </RouterProvider>
  );
}
