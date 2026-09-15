import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import clsx from "clsx";
import { Providers } from "./providers";
import { PropsWithChildren } from "react";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      {
        url: "/favicon/favicon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      { url: "/favicon/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon/favicon.ico", sizes: "32x32", type: "image/x-icon" },
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon/favicon.ico",
    apple: { url: "/favicon/apple-touch-icon.png", sizes: "180x180" },
  },
  appleWebApp: {
    capable: true,
    title: siteConfig.name,
    statusBarStyle: "default",
    startupImage: [
      {
        url: "/screenshots/mobile_screenshot_transactions.png",
        media: "orientation: portrait",
      },
    ],
  },
  other: {
    browsermode: "application",
    "full-screen": "yes",
    "apple-mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default async function Layout({ children }: Readonly<PropsWithChildren>) {
  const cookieStore = await cookies();
  // next-themes only persists to localStorage, invisible to this Server
  // Component, so ThemeCookieSync mirrors it into a cookie — read here to
  // pick the correct initial class and avoid a flash of the wrong theme.
  // "dark" matches the app's defaultTheme when no cookie exists yet.
  const theme = cookieStore.get("theme")?.value === "light" ? "light" : "dark";

  return (
    <html suppressHydrationWarning lang="en" className={theme}>
      <body
        className={clsx(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
        )}
      >
        <Providers>
          <div className="relative flex flex-col h-screen">
            <main className="px-2 md:px-4 grow">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
