import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import clsx from "clsx";
import { Providers } from "./providers";
import { PropsWithChildren } from "react";

// Bump whenever the splash PNGs are re-exported, so Safari's HTTP cache, the
// service worker cache, and iOS (when the home-screen app is re-added) all
// fetch the new bytes instead of a stale copy at the same path. This does NOT
// refresh an already-installed home-screen app on its own: iOS freezes its
// startup images at "Add to Home Screen" time regardless of the URL, so an
// installed app still has to be deleted and re-added to pick up a new version.
const SPLASH_VERSION = "1";

// Each tuple is one iOS device screen in raw pixels plus its pixel ratio; the
// CSS-point media query iOS matches against is derived by dividing by that
// ratio, and the image filename by the raw pixels. Covers every iPhone/iPad
// screen Apple currently lists (iPhone 6 → 17/Air, iPad 9.7" → Pro 13");
// models that share a screen reuse one entry. iOS matches a startup image only
// when device-width/height AND pixel ratio match exactly (no ranges), so the
// list is deduplicated by screen size and two entries may share a CSS size as
// long as their ratios differ (e.g. iPhone 11/XR @2x vs 11 Pro Max/XS Max @3x).
const APPLE_SPLASH_SCREENS: ReadonlyArray<[number, number, number]> = [
  // iPads (ratio 2), largest first
  [2064, 2752, 2],
  [2048, 2732, 2],
  [1668, 2420, 2],
  [1668, 2388, 2],
  [1668, 2224, 2],
  [1640, 2360, 2],
  [1620, 2160, 2],
  [1536, 2048, 2],
  [1488, 2266, 2],
  // iPhones, largest first
  [1320, 2868, 3],
  [1290, 2796, 3],
  [1284, 2778, 3],
  [1260, 2736, 3],
  [1242, 2688, 3],
  [1242, 2208, 3],
  [1206, 2622, 3],
  [1179, 2556, 3],
  [1170, 2532, 3],
  [1125, 2436, 3],
  [1080, 2340, 3],
  [828, 1792, 2],
  [750, 1334, 2],
  [640, 1136, 2],
];

const appleStartupImages = APPLE_SPLASH_SCREENS.map(
  ([width, height, ratio]) => ({
    url: `/splash/splash-${width}x${height}.png?v=${SPLASH_VERSION}`,
    media: `(device-width: ${width / ratio}px) and (device-height: ${
      height / ratio
    }px) and (-webkit-device-pixel-ratio: ${ratio}) and (orientation: portrait)`,
  }),
);

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
    startupImage: appleStartupImages,
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
