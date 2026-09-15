/**
 * Single service worker for the app, registered at scope "/". Combines:
 *  1. Firebase Cloud Messaging background notifications (previously
 *     firebase-messaging-sw.js — only one SW can control a given scope, so
 *     that file was merged in here and removed).
 *  2. App-shell runtime caching + offline navigation fallback.
 *
 * Migration note: this file used to load the Namespace/compat SDKs via
 * importScripts() (firebase-app-compat.js / firebase-messaging-compat.js)
 * and call firebase.initializeApp()/firebase.messaging() in namespace
 * style. It's now on the modular API, imported as native ES modules from
 * the CDN (pinned to match the npm `firebase` package version) — which is
 * why registration must pass { type: "module" } (see
 * ServiceWorkerRegistrar.tsx). Module-scope service workers can't use
 * importScripts() at all, including for local files, so swEnv.js was
 * converted to `export default {...}` and is imported here instead.
 */

// --- Firebase Cloud Messaging -----------------------------------------

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import {
  getMessaging,
  onBackgroundMessage,
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-messaging-sw.js";
import swEnv from "./swEnv.js";

const firebaseApp = initializeApp(swEnv.NEXT_PUBLIC_FIREBASE_APP_CONFIG);

const messaging = getMessaging(firebaseApp);

onBackgroundMessage(messaging, async (payload) => {
  const { title, body, ...data } = payload?.data ?? {};
  const currentNotification = await getCurrentNotification(data.transactionId);

  if (currentNotification) {
    currentNotification.close();
  }

  const options = {
    body,
    data,
    icon: "/favicon/favicon-48x48.png",
    vibrate: [100, 50, 100],
  };
  self.registration.showNotification(title, options);
});

self.addEventListener("notificationclick", function (event) {
  const urlToOpen = new URL(
    "/private/recurring-expenses/management",
    self.location.origin,
  ).href;

  const promiseChain = clients
    .matchAll({ type: "window", includeUncontrolled: true })
    .then((windowClients) => {
      const matchingClient = windowClients.find(
        (windowClient) => new URL(windowClient.url).origin === self.location.origin
      );

      if (matchingClient) {
        return matchingClient
          .navigate(urlToOpen)
          .then((navigatedClient) => (navigatedClient || matchingClient).focus());
      }

      return clients.openWindow(urlToOpen);
    });

  event.waitUntil(promiseChain);
  event.notification.close();
});

async function getCurrentNotification(transactionId) {
  const notifications = await self.registration.getNotifications();
  for (const notification of notifications) {
    if (
      notification.data &&
      notification.data.transactionId === transactionId
    ) {
      return notification;
    }
  }
}

// --- App shell: runtime caching + offline navigation fallback ---------
//
// Next.js build output filenames are content-hashed and unknown at
// SW-authoring time, so there is no static precache manifest here. Instead,
// every successful same-origin GET — full navigations, JS/CSS/manifest/icon
// assets, and the RSC/Flight fetches the App Router makes for client-side
// transitions — is cached as it is fetched, keyed by pathname, and served
// stale-while-revalidate: a cached hit is returned immediately and the
// network fetch that refreshes it (and reports connectivity) runs in the
// background, so a page you've already visited feels instant instead of
// re-paying a full round trip every time. Intercepting the RSC fetches is
// required, not optional: without it, every <Link>/router.push transition
// re-fetches the destination route's Flight payload over the network and
// fails offline even for a page visited moments earlier.

// Bumped whenever an existing entry's caching semantics change in a way
// that a plain overwrite can't fix — e.g. v3 corrects redirected responses
// (see cleanRedirectResponse) that v2 had already cached raw for anyone
// upgrading in place.
const APP_SHELL_CACHE = "app-shell-v3";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(APP_SHELL_CACHE)
      .then((cache) =>
        Promise.all(
          // Not cache.addAll(): it stores whatever fetch() returns as-is,
          // and "/" redirects to /login (src/proxy.ts) — see
          // cleanRedirectResponse for why a redirected response can't be
          // precached raw.
          ["/", "/site.webmanifest"].map((url) =>
            fetch(url)
              .then((response) => cleanRedirectResponse(response))
              .then((response) => cache.put(url, response))
          )
        )
      )
      .catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== APP_SHELL_CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;
  if (new URL(request.url).origin !== self.location.origin) return;

  const isNavigation = request.mode === "navigate";
  const isAppShellAsset = ["script", "style", "image", "manifest"].includes(
    request.destination
  );
  const isRscRequest = request.headers.get("rsc") === "1";

  if (isNavigation || isAppShellAsset || isRscRequest) {
    event.respondWith(
      staleWhileRevalidate(event, request, { isNavigation, isRscRequest })
    );
  }
});

// Next appends a `_rsc=<hash>` cache-busting query param to every Flight
// fetch, and the hash depends on the router state the request was made
// from — matching on the raw request URL would rarely hit. Cache keys are
// normalized to the bare pathname instead, with RSC responses kept in a
// separate keyspace from full-document responses for the same pathname
// (same URL, but completely different response shape).
//
// Next's App Router (since the segment cache became the only prefetch/
// navigation mechanism) issues MULTIPLE distinct RSC requests for a single
// route — a route-tree metadata request plus one or more per-segment data
// requests — all to the SAME pathname, distinguished only by the
// `next-router-segment-prefetch` header (which piece) and, for routes
// without PPR, the `next-router-state-tree` header (what the client already
// has rendered). Without folding those headers into the key, every one of
// those requests collapses onto one cache entry and overwrites the last,
// so router.prefetch()'s warm-up (src/components/shared/AuthGuard.tsx)
// leaves behind a cached response that doesn't match what an actual offline
// navigation asks for — the route "warms" but still fails to load offline.
function cacheKeyFor(request, isRscRequest) {
  const url = new URL(request.url);
  url.searchParams.delete("_rsc");
  if (isRscRequest) {
    url.searchParams.set("__sw_rsc", "1");
    const segmentPrefetch = request.headers.get("next-router-segment-prefetch");
    if (segmentPrefetch) url.searchParams.set("__sw_segment", segmentPrefetch);
    const stateTree = request.headers.get("next-router-state-tree");
    if (stateTree) url.searchParams.set("__sw_tree", stateTree);
  }
  return url.toString();
}

async function staleWhileRevalidate(
  event,
  request,
  { isNavigation, isRscRequest } = {}
) {
  const cache = await caches.open(APP_SHELL_CACHE);
  const cacheKey = cacheKeyFor(request, isRscRequest);
  const cached = await cache.match(cacheKey);

  const revalidate = fetchAndCache(event, cache, cacheKey, request);

  if (cached) {
    // Serve the cached copy immediately and let the network refresh it (and
    // report connectivity) in the background instead of blocking on it —
    // waitUntil keeps the SW alive for that background work without making
    // the page wait for it. Swallow the rejection here: a failed background
    // revalidation has already been handled (broadcastNetworkStatus) inside
    // fetchAndCache, there's nothing left for this call site to do with it.
    event.waitUntil(revalidate.catch(() => {}));
    return cached;
  }

  try {
    return await revalidate;
  } catch (error) {
    // Only a full-document navigation gets the offline placeholder below.
    // An uncached RSC miss instead propagates so the App Router's own
    // fallback (a hard navigation, which re-enters this handler as
    // `isNavigation`) can run — serving another route's cached markup here
    // would produce a hydration mismatch for the *actual* requested route.
    if (isNavigation) return offlineFallbackResponse();

    throw error;
  }
}

async function fetchAndCache(event, cache, cacheKey, request) {
  try {
    const response = await fetch(request);
    // A real fetch failure here is the SW's own ground truth for
    // connectivity — navigator.onLine/the online/offline events on the page
    // are unreliable (e.g. connected to a LAN with no upstream internet
    // never fires 'offline'), so tell every open tab explicitly whenever a
    // request actually fails, instead of leaving them to guess.
    event.waitUntil(broadcastNetworkStatus(true));
    if (!response?.ok) return response;

    // This app's middleware redirects "/" to /login and redirects protected
    // routes based on auth state (src/proxy.ts, src/middlewares/
    // authentication.ts), so `fetch()` following that redirect hands back a
    // Response with `.redirected === true` on real, common traffic — not an
    // edge case. Browsers refuse to let a Response with that flag set
    // fulfill a navigation FetchEvent once it comes back out of the Cache
    // API, so a redirected response must be rebuilt without the flag before
    // it's stored, or Safari fails to render the page the next time it's
    // served offline.
    const clean = await cleanRedirectResponse(response);
    event.waitUntil(cache.put(cacheKey, clean.clone()));
    return clean;
  } catch (error) {
    event.waitUntil(broadcastNetworkStatus(false));
    throw error;
  }
}

async function cleanRedirectResponse(response) {
  if (!response.redirected) return response;

  const body = await response.blob();
  return new Response(body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}

async function broadcastNetworkStatus(isOnline) {
  const clients = await self.clients.matchAll({ type: "window" });
  for (const client of clients) {
    client.postMessage({ type: "network-status", isOnline });
  }
}

function offlineFallbackResponse() {
  return new Response(
    `<!doctype html><html><body style="background:#111;color:#eee;font-family:system-ui,sans-serif;display:flex;height:100vh;margin:0;align-items:center;justify-content:center;text-align:center;padding:2rem;"><div><h1>You're offline</h1><p>This page hasn't been loaded yet, so it isn't available offline. Reconnect and try again.</p></div></body></html>`,
    { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}
