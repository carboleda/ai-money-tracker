"use client";

import "@/firebase/client";
import * as React from "react";
import { HeroUIProvider } from "@heroui/system";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ThemeProviderProps } from "next-themes/dist/types";
import { SWRConfig } from "swr";
import TranslationsProvider from "@/components/providers/TranslationsProvider";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

export function Providers({ children, themeProps }: ProvidersProps) {
  const router = useRouter();

  return (
    <HeroUIProvider navigate={router.push}>
      <NextThemesProvider {...themeProps}>
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
