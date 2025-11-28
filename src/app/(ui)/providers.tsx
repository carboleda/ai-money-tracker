"use client";

import "@/firebase/client";
import * as React from "react";
import { HeroUIProvider } from "@heroui/system";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { SWRConfig } from "swr";
import { ToastProvider } from "@heroui/toast";
import TranslationsProvider from "@/components/providers/TranslationsProvider";

export interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const router = useRouter();

  return (
    <HeroUIProvider navigate={router.push}>
      <ToastProvider toastOffset={40} />
      <NextThemesProvider attribute="class" defaultTheme="dark">
        <SWRConfig
          value={{
            refreshInterval: 0,
            revalidateOnFocus: false,
            fetcher: (resource, init) =>
              fetch(resource, init).then((res) => res.json()),
          }}
        >
          <TranslationsProvider>{children}</TranslationsProvider>
        </SWRConfig>
      </NextThemesProvider>
    </HeroUIProvider>
  );
}
