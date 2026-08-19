# Zolvent V2 Specifications & Implementation Plan

This document outlines the finalized product requirements, visual design specifications, and implementation roadmap for **Zolvent V2**—delivering a **Lightning-Fast Native PWA Experience** with a focused AI Draft Transaction pipeline, Shadcn UI redesign, and zero offline-sync conflict overhead.

---

## 1. Visual Design & Theme System (Design Reference Matching)

Following `openspec/changes/ui-redesign/images/zolvent-design-reference.jpeg`:

- **Color Palette & Accents:**
  - Dark Surface Background: Matte charcoal/dark slate (`#121214` / `bg-zinc-950`).
  - Container & Card Layers: Smooth dark card surfaces (`bg-zinc-900/80 border border-zinc-800/80 rounded-2xl`).
  - **Brand Accent Color:** Vibrant **Lime/Neon Green** (`#a3e635` / `#84cc16`) for active toggles, primary CTA buttons, badged chips, and highlighted metrics.
  - Secondary Category Accents: Pastel coral pink, warm orange, electric cyan, and soft yellow for category charts and indicators.
- **UI Component Style:**
  - High-contrast typography, pills, and rounded cards (`rounded-2xl` & `rounded-3xl`).
  - Fixed Bottom Navigation Bar with clean stroke icons (Dashboard, Action, Wallet, Settings).
  - Tactile micro-animations on interactive press states.

---

## 2. Technical Stack & Testing Strategy

### Data Fetching & Caching

- **TanStack Query v5 (`@tanstack/react-query`)**:
  - Combined with `@tanstack/react-query-persist-client` + IndexedDB persister.
  - Hydrates cache synchronously on cold boot for instant sub-50ms rendering.
  - Offline-aware write guards via `useOnlineStatus` hook.

### Component Library

- **Shadcn UI + Tailwind CSS 4**:
  - Replacing HeroUI v2 with lightweight, zero-dependency Shadcn primitives in `src/components/ui`.
  - Built to match the exact aesthetic of `zolvent-design-reference.jpeg`.

### Testing Separation

- **Backend Tests:** **Jest** (`npx jest`) reserved exclusively for `src/app/api/` domain services, repositories, and handlers.
- **UI / Frontend Tests:** **Playwright** (`npx playwright test`) for all component interactions, visual workflows, and E2E browser testing.

---

## 3. Phase 3 Scope (Refined AI Draft Pipeline)

### In-Scope: Feature A — Natural Language & Multimodal Draft Pipeline

```
  [User Input: Voice / Text / Receipt Photo]
                      │
                      ▼
        [Genkit AI / Local Parser]
                      │
                      ▼
      ┌───────────────────────────────┐
      │     Draft Preview Card        │
      │  (Matte Dark / Lime Accents)  │
      │                               │
      │  Badged Editable Chips:       │
      │  [ 💵 $45.00  ▼ ] (Amount)    │
      │  [ 🛒 Grocery ▲ ] (Category)  │
      │  [ 💳 Chase   ▼ ] (Account)   │
      │  [ 🏷️ Type    ▼ ] (Type)      │
      │  [ 📅 Today   ▼ ] (DateTime)  │
      │                               │
      │  [ ⚡ Auto-confirming (5s)  ]  │
      │  [      ( UNDO BUTTON )    ]  │
      └───────────────────────────────┘
                      │ User Confirms or 5s Expires
                      ▼
         [ Final Mutation to DB ]
```

1. **Draft State Mechanics:**
   - Any transaction registered via natural language (Voice, Text prompt, or camera receipt scan) is assigned `status: "draft"`.
2. **Interactive Badged Chips:**
   - Clickable chips for `[Amount]`, `[Category]`, `[Account]`, `[Type]`, `[DateTime]` styled with vibrant lime green borders/accents.
   - Tapping a chip opens a fast inline selector popover to edit fields before saving.
3. **Quick Auto-Confirm UX:**
   - High-confidence matches ($> 0.85$) feature a 5-second animated countdown bar with a prominent **Undo** button.

### Deferred Out of Scope (Post-Refactor Roadmap)

- _Feature B: Safe-to-Spend Oracle Hero Widget_ — Deferred to post-main refactor.
- _Feature C: Predictive Forecast Timeline_ — Deferred to post-main refactor.
- _Feature D: Conversational AI Financial Advisor Drawer_ — Deferred to post-main refactor.

---

## 4. Architecture & Directory Blueprint

```
src/
├── app/
│   ├── (ui)/
│   │   ├── private/
│   │   │   ├── (summary)/            # Summary Dashboard
│   │   │   ├── accounts/             # Bank accounts view
│   │   │   ├── transactions/         # Transactions feed & Draft card
│   │   │   └── recurring-expenses/   # Recurring rules
│   ├── api/
│   │   └── drivers/genai/            # Genkit AI transaction parsing
├── components/
│   ├── ui/                           # Shadcn primitive components [NEW]
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── badge.tsx
│   │   ├── popover.tsx
│   │   └── input.tsx
│   ├── features/
│   │   └── draft-transaction/        # Draft Preview Card & Chips [NEW]
│   └── shared/
├── hooks/
│   ├── useOnlineStatus.ts            # Network connectivity monitor [NEW]
│   ├── useAccounts.ts                # Converted to TanStack Query [MODIFY]
│   └── useTransactions.ts            # Converted to TanStack Query [MODIFY]
├── lib/
│   ├── query-client.ts               # TanStack Query + IndexedDB Persister [NEW]
│   └── utils.ts                      # Shadcn `cn` utility helper [NEW]
└── stores/
    └── transaction-draft.store.ts    # Transient draft state store [NEW]
```

---

## 5. Execution Roadmap

### Milestone 1: Data Layer & Foundation

- Setup TanStack Query v5 with `@tanstack/react-query-persist-client` and IndexedDB persister in `src/app/(ui)/providers.tsx`.
- Install Shadcn UI dependencies (`clsx`, `tailwind-merge`, `lucide-react`, `@radix-ui/*`).
- Create `src/lib/utils.ts` and `src/hooks/useOnlineStatus.ts`.

### Milestone 2: Core React-Query Migration

- Migrate `useAccountsLoader`, `useCategoriesLoader`, `useGetUser` to `useQuery`.
- Migrate `useMutateTransaction`, `useMutateAccount`, `useMutateUser` to `useMutation` with online guards.

### Milestone 3: UI Redesign & Draft Preview Card

- Build dark matte UI with **Lime Green accents** matching `zolvent-design-reference.jpeg`.
- Build `DraftPreviewCard.tsx` with interactive badged chips for `[Amount]`, `[Category]`, `[Account]`, `[Type]`, and `[DateTime]`.
- Implement Playwright E2E test suite for UI workflows (`tests/e2e/`).

---

## Verification Plan

### Backend Automated Tests (Jest)

- Unit tests for domain models & service logic (`npx jest src/app/api/...`).

### Frontend UI & E2E Tests (Playwright)

- Playwright E2E test for transaction draft parsing & chip editing (`npx playwright test tests/e2e/draft-transaction.spec.ts`).
- Playwright E2E test for offline read cache rendering and online write block alert.
