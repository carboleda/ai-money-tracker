/**
 * Single service worker for the app, registered at scope "/". Combines:
 *  1. Firebase Cloud Messaging background notifications (previously
 *     firebase-messaging-sw.js — only one SW can control a given scope, so
 *     that file was merged in here and removed).
 *  2. App-shell runtime caching + offline navigation fallback.
 */

// --- Firebase Cloud Messaging -----------------------------------------

importScripts(
  "https://www.gstatic.com/firebasejs/11.6.1/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/11.6.1/firebase-messaging-compat.js"
);
importScripts("swEnv.js");

firebase.initializeApp(swEnv.NEXT_PUBLIC_FIREBASE_APP_CONFIG);

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  const { title, body, ...data } = payload?.data ?? {};
  const currentNotification = getCurrentNotification(data.transactionId);

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
    "https://zolvent.calabs.dev/private/recurring-expenses/management",
    self.location.origin
  ).href;

  const promiseChain = clients
    .matchAll({ type: "window", includeUncontrolled: true })
    .then((windowClients) => {
      const matchingClient = windowClients.find(
        (windowClient) => windowClient.url === urlToOpen
      );

      if (matchingClient) {
        return matchingClient.focus();
      }

      return clients.openWindow(urlToOpen);
    });

  event.waitUntil(promiseChain);
  event.notification.close();
});

function getCurrentNotification(transactionId) {
  const notifications = self.registration.getNotifications();
  for (let i = 0; i < notifications.length; i++) {
    if (
      notifications[i].data &&
      notifications[i].data.transactionId === transactionId
    ) {
      return notifications[i];
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
// from that cache when the network is unavailable. Intercepting the RSC
// fetches is required, not optional: without it, every <Link>/router.push
// transition re-fetches the destination route's Flight payload over the
// network and fails offline even for a page visited moments earlier.

const APP_SHELL_CACHE = "app-shell-v1";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(APP_SHELL_CACHE)
      .then((cache) => cache.addAll(["/", "/site.webmanifest"]))
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
      networkFirstWithCache(event, request, { isNavigation, isRscRequest })
    );
  }
});

// Next appends a `_rsc=<hash>` cache-busting query param to every Flight
// fetch, and the hash depends on the router state the request was made
// from — matching on the raw request URL would rarely hit. Cache keys are
// normalized to the bare pathname instead, with RSC responses kept in a
// separate keyspace from full-document responses for the same pathname
// (same URL, but completely different response shape).
function cacheKeyFor(request, isRscRequest) {
  const url = new URL(request.url);
  url.searchParams.delete("_rsc");
  if (isRscRequest) url.searchParams.set("__sw_rsc", "1");
  return url.toString();
}

async function networkFirstWithCache(
  event,
  request,
  { isNavigation, isRscRequest } = {}
) {
  const cache = await caches.open(APP_SHELL_CACHE);
  const cacheKey = cacheKeyFor(request, isRscRequest);

  try {
    const response = await fetch(request);
    if (response?.ok) {
      // Not awaited (so it doesn't delay the response the page is waiting
      // on), but handed to waitUntil so the SW isn't torn down mid-write —
      // an un-extended fire-and-forget promise can be aborted the instant
      // respondWith() resolves.
      event.waitUntil(cache.put(cacheKey, response.clone()));
    }
    return response;
  } catch (error) {
    const cached = await cache.match(cacheKey);
    if (cached) return cached;

    // Only a full-document navigation gets the offline placeholder below.
    // An uncached RSC miss instead propagates so the App Router's own
    // fallback (a hard navigation, which re-enters this handler as
    // `isNavigation`) can run — serving another route's cached markup here
    // would produce a hydration mismatch for the *actual* requested route.
    if (isNavigation) return offlineFallbackResponse();

    throw error;
  }
}

function offlineFallbackResponse() {
  return new Response(
    `<!doctype html><html><body style="background:#111;color:#eee;font-family:system-ui,sans-serif;display:flex;height:100vh;margin:0;align-items:center;justify-content:center;text-align:center;padding:2rem;"><div><h1>You're offline</h1><p>This page hasn't been loaded yet, so it isn't available offline. Reconnect and try again.</p></div></body></html>`,
    { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}
