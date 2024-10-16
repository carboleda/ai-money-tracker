"use client";

import { firebaseApp } from "@/firebase/client";
import * as React from "react";
import { NextUIProvider } from "@nextui-org/system";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import FcmProvider from "@/components/FcmProvider";
import { ThemeProviderProps } from "next-themes/dist/types";
import { SWRConfig } from "swr";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

export function Providers({ children, themeProps }: ProvidersProps) {
  const router = useRouter();

  return (
    <NextUIProvider navigate={router.push}>
      <FcmProvider firebaseApp={firebaseApp}>
        <NextThemesProvider {...themeProps}>
          <SWRConfig
            value={{
              refreshInterval: 0,
              revalidateOnFocus: false,
              fetcher: (resource, init) =>
                fetch(resource, init).then((res) => res.json()),
            }}
          >
            {children}
          </SWRConfig>
        </NextThemesProvider>
      </FcmProvider>
    </NextUIProvider>
  );
}
