# Zolvent Offline-First Architecture & Caching Strategy

This document isolates the **offline-first data layer, caching strategy, and offline navigation** work from `UX_REDESIGN_v2.md`. It is derived partly from that doc's "Data Fetching & Caching" section and partly from repo analysis of a routing gap that document does not mention.

## Out of Scope

The following are covered in `UX_REDESIGN_v2.md` and are **not** part of this document:

- UI framework migration (HeroUI → Shadcn UI / Tailwind CSS 4).
- Visual/theme redesign (dark matte surfaces, lime-green accents, category color system).
- New features: AI Draft Transaction pipeline (badged chips, auto-confirm), and the deferred Safe-to-Spend Oracle, Predictive Forecast Timeline, and Conversational AI Advisor.

---

## 1. Current State

- **Data fetching is 100% SWR.** `SWRConfig` is set up in `src/app/(ui)/providers.tsx`, and every read/write hook (`useAccountsLoader`, `useCategoriesLoader`, `useGetUser`, `useMutateTransaction`, `useMutateAccount`, `useMutateUser`, `useMutateRecurringExpense`) uses `useSWR`/`useSWRMutation`. There is no cache persistence — the cache is memory-only and empty on every cold boot.
- **No service worker.** `public/site.webmanifest` exists and is linked from `src/app/(ui)/layout.tsx`, so the app is installable, but nothing registers a service worker. Today's "PWA" is an installable shell only — it has no offline capability.
- **Navigation is not offline-safe, even though most pages already fetch data client-side.** Every route under `src/app/(ui)/private/**` (`(summary)`, `accounts`, `transactions`, `recurring-expenses`, `recurring-expenses/management`) is a trivial **Server Component** `page.tsx` that immediately delegates to a client `PageContent` component — it does no server-side data fetching. Same for the root layout and `private/layout.tsx`. Despite having no server data dependency, Next.js App Router still performs a network round-trip for the RSC/Flight payload of the target route on every client-side navigation. Offline, that round-trip fails and navigation breaks — independent of how good the client-side data cache is.
- **Auth is enforced in middleware** (`src/middlewares/authentication.ts`, `authorization.ts`), which runs on the network request path. If a service worker later serves cached responses directly while offline, middleware never executes, so auth gating needs a client-side backstop.

---

## 2. Target Architecture

### 2.1 Data Layer: TanStack Query + IndexedDB Persistence

- **TanStack Query v5** (`@tanstack/react-query`) replaces SWR completely as the data-fetching library.
- **`@tanstack/react-query-persist-client`** + an IndexedDB persister hydrates the query cache synchronously on cold boot, enabling instant (sub-50ms) rendering of previously-seen data before any network activity.
- Reads use `useQuery` with cache-first, stale-while-revalidate semantics (serve cached data immediately, refetch in the background when online).

### 2.2 Offline-Aware Writes

- A `useOnlineStatus` hook tracks network connectivity (`navigator.onLine` + `online`/`offline` events).
- Mutations (`useMutation`) are guarded by this hook: while offline, writes are **blocked** and the user sees an alert — there is no offline write queue and no sync-conflict resolution. This keeps the write model simple ("zero offline-sync conflict overhead") at the cost of writes not being available offline.

### 2.3 Offline Navigation: App-Shell Service Worker

Because the data layer alone doesn't fix navigation, a service worker is required to:
- Precache the app shell — JS/CSS bundles, `site.webmanifest`, icons.
- Serve a navigation fallback so route changes resolve from cache instead of failing on a network request when offline.

This is paired with converting the currently server-rendered shells to Client Components, since a Server Component page still requires the RSC negotiation the service worker needs to intercept — removing the server dependency makes that interception straightforward instead of fighting the RSC protocol.

### 2.4 Client-Side Auth Guard

Since the service worker can serve cached pages without invoking middleware, `private/layout.tsx` gains a client-side `AuthGuard` that reads the persisted `useGetUser` query result and redirects to `/login` when there's no cached authenticated user. This preserves the auth gate for the offline case; middleware remains the primary gate when online.

---

## 3. File & Directory Map

```
src/
├── app/(ui)/
│   ├── layout.tsx                                  [MODIFY] Server → Client Component shell
│   ├── providers.tsx                               [MODIFY] SWRConfig → QueryClientProvider + persister
│   └── private/
│       ├── layout.tsx                              [MODIFY] Server → Client Component; mount <AuthGuard>
│       ├── (summary)/page.tsx                      [MODIFY] Server → Client Component shell
│       ├── accounts/page.tsx                       [MODIFY] Server → Client Component shell
│       ├── transactions/page.tsx                   [MODIFY] Server → Client Component shell
│       ├── recurring-expenses/page.tsx             [MODIFY] Server → Client Component shell
│       └── recurring-expenses/management/page.tsx  [MODIFY] Server → Client Component shell
├── components/
│   └── shared/AuthGuard.tsx                        [NEW] client-side auth gate, reads cached useGetUser
├── hooks/
│   ├── useOnlineStatus.ts                          [NEW] network connectivity hook
│   ├── useAccountsLoader.ts                        [MODIFY] SWR → TanStack useQuery
│   ├── useCategoriesLoader.ts                      [MODIFY] SWR → TanStack useQuery
│   ├── useGetUser.ts                               [MODIFY] SWR → TanStack useQuery
│   ├── useMutateTransaction.ts                     [MODIFY] SWR → TanStack useMutation + online guard
│   ├── useMutateAccount.ts                         [MODIFY] same
│   ├── useMutateUser.ts                            [MODIFY] same
│   └── useMutateRecurringExpense.ts                [MODIFY] same
├── lib/
│   └── query-client.ts                             [NEW] QueryClient + IndexedDB persister config
└── middlewares/
    ├── authentication.ts                           [REVIEW] no-ops when SW serves a cached response
    └── authorization.ts                            [REVIEW] same caveat, documented not solved

public/
└── app-shell-sw.js                                 [NEW] service worker: precaches JS/CSS/manifest/icons + serves navigation fallback offline

package.json                                        [MODIFY] remove `swr` (full removal, no dual-library period)
```

### Boot & Navigation Flow

```
Cold boot (online or offline)
  └─ Service Worker intercepts navigation request
       ├─ cached? → serve app-shell HTML/JS instantly (offline-capable)
       └─ not cached? → network fetch, then cache for next time
  └─ QueryClientProvider hydrates from IndexedDB persister (sub-50ms)
  └─ <AuthGuard> checks persisted useGetUser cache → render private layout or redirect /login
  └─ PageContent renders from cached TanStack Query data immediately
       └─ if online → background refetch (stale-while-revalidate)

Mutation (create/update/delete)
  └─ useOnlineStatus check
       ├─ offline → block, surface alert, no queueing
       └─ online  → TanStack useMutation → API → cache update
```

---

## 4. Execution Roadmap

### Milestone 1: Data Layer & Foundation

- Install `@tanstack/react-query`, `@tanstack/react-query-persist-client`, and an IndexedDB persister.
- Create `src/lib/query-client.ts` (QueryClient + persister config) and wire `QueryClientProvider` into `src/app/(ui)/providers.tsx`, replacing `SWRConfig`.
- Create `src/hooks/useOnlineStatus.ts`.

### Milestone 2: Core Hook Migration

- Migrate all 3 loader hooks (`useAccountsLoader`, `useCategoriesLoader`, `useGetUser`) to `useQuery`.
- Migrate all 4 mutation hooks (`useMutateTransaction`, `useMutateAccount`, `useMutateUser`, `useMutateRecurringExpense`) to `useMutation` with online guards via `useOnlineStatus`.
- Remove `swr` and `swr/mutation` from `package.json` — no hooks remain on SWR after this milestone.

### Milestone 3: Offline Navigation

- Convert `src/app/(ui)/layout.tsx`, `src/app/(ui)/private/layout.tsx`, and the 5 `private/**/page.tsx` shells to Client Components.
- Add `src/components/shared/AuthGuard.tsx` and mount it in `private/layout.tsx`.
- Add `public/app-shell-sw.js` (precache + navigation fallback) and register it on app boot.

---

## Verification Plan

Playwright E2E only (`npx playwright test`) — no backend/Jest impact, this is entirely a client-side change:

- Offline read: render a previously-visited page fully from the persisted cache with the network disabled.
- Offline write: attempt a mutation with the network disabled and confirm the write is blocked with a visible alert.
- Offline navigation: navigate between previously-visited routes with the network disabled and confirm no navigation error occurs.
