"use client";

import { PropsWithChildren, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useIsRestoring } from "@tanstack/react-query";
import { useGetUser } from "@/hooks/useGetUser";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { pages } from "@/config/site";

const PRIVATE_ROUTES = pages
  .flatMap((entry) => ("pages" in entry ? entry.pages : [entry]))
  .map((page) => page.href)
  .filter((href): href is string => Boolean(href));

/**
 * Client-side auth backstop for the private section. Middleware is the
 * primary gate when online, but a service worker can serve a cached page
 * without ever hitting middleware — this redirects to /login when the
 * persisted query cache has no authenticated user (e.g. offline, never
 * logged in on this device).
 */
export function AuthGuard({ children }: Readonly<PropsWithChildren>) {
  const router = useRouter();
  const isRestoring = useIsRestoring();
  const { user, isLoading } = useGetUser();
  const { isOnline } = useOnlineStatus();
  const isChecking = isRestoring || isLoading;
  const hasWarmedRouteCache = useRef(false);

  useEffect(() => {
    if (isChecking) return;
    if (!user) router.replace("/login");
  }, [isChecking, user, router]);

  // Warms the service worker's offline route cache once per app load, so
  // every private route is navigable offline — not just ones the user
  // happens to have clicked into during this session. router.prefetch()
  // triggers the same RSC/Flight fetch app-shell-sw.js already intercepts
  // and caches; this just makes sure it runs for all routes while online,
  // not only the ones the user visits before going offline.
  useEffect(() => {
    if (isChecking || !user || !isOnline || hasWarmedRouteCache.current) {
      return;
    }
    hasWarmedRouteCache.current = true;
    PRIVATE_ROUTES.forEach((href) => router.prefetch(href));
  }, [isChecking, user, isOnline, router]);

  // Only a confirmed unauthenticated state blanks the content — while
  // checking (the common case, since the query cache is usually already
  // warm from persistence), render immediately so navigation feels instant.
  if (!isChecking && !user) return null;

  return <>{children}</>;
}
