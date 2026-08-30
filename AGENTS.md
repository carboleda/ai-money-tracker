# AGENTS.md — AI Money Tracker (Zolvent)

Guidelines for agentic coding agents working in this repository.

---

## Project Overview

**Stack:** Next.js 16 (App Router) · TypeScript 5.9 · React 19 · Firebase (Firestore + Auth + FCM) · Tailwind CSS 4 · HeroUI · Zustand · SWR · Zod · tsyringe DI · Google Genkit AI

**Architecture:** Hexagonal / Clean Architecture. The backend lives entirely inside `src/app/api/` and is organized into `domain/` (business logic) and `drivers/` (infrastructure adapters). The frontend is under `src/app/(ui)/` and `src/components/`.

---

## Commands

### Development

```bash
npm run dev              # Start dev server (HTTP, Turbopack, GENKIT_ENV=dev)
npm run dev:localdb      # Dev server against local Firestore emulator
npm run dev:full         # Start Firebase emulators + dev server together
npm run firebase:start   # Firebase emulators only
```

### Build & Lint

```bash
npm run build            # Production build
npm run lint             # ESLint over src/ (.ts, .tsx, .js, .jsx)
```

### Tests

```bash
npm test                         # Run all tests with coverage
npm run test:watch               # Watch mode with coverage

# Run a single test file
npx jest src/path/to/file.spec.ts

# Run tests matching a name pattern
npx jest --testPathPattern="create-transaction"

# Run a single test with coverage
npx jest --coverage src/path/to/file.spec.ts
```

Test files are co-located with source in `__tests__/` subdirectories and use the `.spec.ts` suffix. The test environment is `node` (no jsdom). Path alias `@/` resolves to `src/` in tests via `moduleNameMapper`.

---

## TypeScript

- **Strict mode is on** (`"strict": true`). No `any` unless absolutely necessary; prefer `unknown` and narrow with type guards.
- **Decorator support** is enabled (`experimentalDecorators`, `emitDecoratorMetadata`) — required by tsyringe.
- **Path alias:** Use `@/` for all internal imports (maps to `src/`). Never use relative `../../` paths across domain boundaries.
- **`import type`** for type-only imports to keep runtime output clean.
- Target is `ES2020`; use modern JS features freely.

---

## Code Style & Formatting

- **No Prettier** is configured. Match the existing style manually.
- **Quotes:** Double quotes for strings (`"foo"`, not `'foo'`).
- **Indentation:** 2 spaces.
- **Semicolons:** Yes, always.
- **Trailing commas:** Yes, in multi-line structures.

---

## Imports

```typescript
// 1. reflect-metadata must be first in any file that uses tsyringe decorators
import "reflect-metadata";

// 2. External packages
import { NextResponse } from "next/server";

// 3. Internal — use @/ alias, never deep relative paths across boundaries
import type { TransactionRepository } from "@/app/api/domain/transaction/ports/outbound/transaction.repository";
import { CreateTransactionService } from "@/app/api/domain/transaction/service/create-transaction.service";

// 4. Type-only imports use `import type`
import type { FilterParams } from "@/interfaces/filters";
```

- Prefer **named exports** everywhere. Default exports are only used on Next.js page components and API route handlers (Next.js requires them).
- No barrel (`index.ts`) re-exports unless one already exists in that directory.

---

## Naming Conventions

| Entity               | Convention                                  | Example                                        |
| -------------------- | ------------------------------------------- | ---------------------------------------------- |
| Files                | `kebab-case`                                | `create-transaction.service.ts`                |
| Classes              | `PascalCase`                                | `CreateTransactionService`                     |
| Interfaces           | `PascalCase`, no `I` prefix                 | `TransactionRepository`                        |
| Type aliases         | `PascalCase`                                | `TransactionFilters`                           |
| Enums                | `PascalCase` name, `SCREAMING_SNAKE` values | `TransactionType.INCOME`                       |
| React components     | `PascalCase` named export                   | `export const TransactionInput`                |
| Custom hooks         | `camelCase` with `use` prefix               | `useMutateTransaction`                         |
| Module constants     | `SCREAMING_SNAKE_CASE`                      | `const CACHE_KEY = "/api/transaction"`         |
| Private class fields | `private readonly camelCase`                | `private readonly repo: TransactionRepository` |

---

## Architecture

```
src/app/api/
├── (routes)/         # Next.js route handlers — thin HTTP layer only
├── context/          # Request-scoped user context (injected via DI)
├── decorators/       # Custom tsyringe decorators (@Injectable, @InjectRepository, @OnEvent, …)
├── domain/           # Business logic — NO framework imports allowed here
│   ├── <entity>/
│   │   ├── model/          # Domain models (classes with constructors)
│   │   ├── ports/
│   │   │   ├── inbound/    # Input DTOs / use-case interfaces
│   │   │   └── outbound/   # Repository interfaces, output DTOs
│   │   ├── service/        # Use-case implementations
│   │   ├── repository/     # Repository interface (port definition)
│   │   └── mapper/         # Transforms between domain ↔ infrastructure models
│   └── shared/
│       ├── errors/         # DomainError base class
│       └── interfaces/     # Shared generic contracts (Service<I,O>, Repository<T>)
└── drivers/          # Infrastructure adapters (implement domain ports)
    ├── firestore/    # Firestore repository implementations
    ├── genai/        # Google Genkit AI integration
    └── messaging/    # Firebase Cloud Messaging
```

**Rules:**

- `domain/` must not import from `drivers/` or `app/api/(routes)/`.
- Route handlers must not contain business logic — delegate entirely to services.
- Services depend on repository interfaces (ports), never on concrete implementations.

---

## Dependency Injection (tsyringe)

- Always import `"reflect-metadata"` as the **first line** of any file that uses decorators or registers providers.
- Use `@Injectable()` on all service and repository classes.
- Wire up a domain slice via a static `XModule.register()` method that registers all providers in the DI container.
- Inject dependencies with `@InjectRepository()`, `@InjectUserContext()`, or plain `@inject("token")`.
- The container is bootstrapped lazily in `src/app/api/index.ts`.

```typescript
import "reflect-metadata";
import { injectable, inject } from "tsyringe";

@injectable()
export class CreateTransactionService implements Service<
  CreateTransactionInput,
  Transaction
> {
  constructor(
    @inject("TransactionRepository")
    private readonly repo: TransactionRepository,
  ) {}
}
```

---

## React Components

- Add `"use client"` at the top of any component that uses browser APIs, hooks, or event handlers.
- Type props with an explicit `interface`: `export interface MyComponentProps { ... }`.
- Use `React.FC<Props>` for component type annotations.
- Use **SWR** (`useSWR`, `useSWRMutation`) for all client-side data fetching — never `useEffect` + `fetch`.
- Use **HeroUI** components as the primary UI library; style with **Tailwind CSS** utility classes.
- All user-facing strings must use `useTranslation()` from `react-i18next`. No hardcoded UI text.
- Co-locate feature-specific components under `src/components/features/<feature>/`; shared/reusable ones go in `src/components/shared/`.

---

## Theming (Light/Dark)

- Theme tokens are defined as CSS variables in `src/styles/globals.css`, scoped under `:root, .light, .default, [data-theme="light"]` and `.dark, [data-theme="dark"]`. HeroUI's Tailwind v4 plugin exposes each variable as a utility class (`bg-*`, `text-*`, `border-*`).
- **Never use hardcoded Tailwind palette colors** (`zinc-*`, `gray-*`, `rose-*`, `emerald-*`, `cyan-*`, `amber-*`, `lime-*`, etc.) and **never use the `dark:` variant prefix** — every other component in the app relies solely on semantic tokens, which auto-adapt to the active theme with zero conditional logic.
- Available semantic tokens (use the bare name as the Tailwind class, e.g. `bg-surface`, `text-foreground`, `border-border`):

  | Token                                                                          | Use for                                                                                                   |
  | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
  | `background` / `foreground`                                                    | Page-level background / default text                                                                      |
  | `surface`, `surface-secondary`, `surface-tertiary` (+ `-foreground`)           | Panels, cards, elevated containers                                                                        |
  | `overlay` / `overlay-foreground`                                               | Modal/dialog surfaces (HeroUI `Modal.Dialog` already applies `bg-overlay` by default — don't override it) |
  | `default` / `default-foreground`                                               | Neutral chips, subtle buttons, dividers                                                                   |
  | `field-background` / `field-foreground` / `field-border` / `field-placeholder` | Text inputs, textareas, date/time inputs                                                                  |
  | `border` / `separator`                                                         | Borders, hairlines                                                                                        |
  | `muted`                                                                        | Secondary/placeholder text                                                                                |
  | `accent` / `accent-foreground`                                                 | Brand highlight (AI/sparkle affordances, active/selected state)                                           |
  | `success` / `warning` / `danger` (+ `-foreground`)                             | Semantic status — see below                                                                               |
  | `focus`                                                                        | Focus rings (usually automatic via HeroUI)                                                                |

- **Modals:** Don't set a custom background/border className on `Modal.Dialog` — it already themes itself via `bg-overlay`. Only add layout/shape classes (e.g. `rounded-t-3xl` for a bottom sheet) when customizing.
- **Banners/inline messages:** Use HeroUI's `Alert` component instead of a hand-rolled `<div>`. Compound API: `<Alert status="warning|danger|success|accent|default"><Alert.Indicator /><Alert.Content><Alert.Title>…</Alert.Title><Alert.Description>…</Alert.Description></Alert.Content></Alert>`. `Alert.Indicator` renders a default icon per `status` if left empty; `Alert.Title` is optional for single-line messages.
- **Transaction type color convention** (established in `src/components/TransactionTypeDecorator.tsx`, reuse everywhere a transaction type needs a color): `TransactionType.INCOME → success`, `TransactionType.EXPENSE → danger`, `TransactionType.TRANSFER → warning`. Apply via HeroUI `color`/status props (`Chip`, `Alert`) or the matching `text-success`/`text-danger`/`text-warning` utility — don't invent new colors (e.g. rose/emerald/cyan) for this semantic.

---

## Error Handling

- **Domain layer:** Throw `DomainError` (from `src/app/api/domain/shared/errors/`) with a `statusCode` and optional `details`. Never swallow errors silently.
- **Route handlers:** Wrap in `try/catch`, cast the error to `DomainError`, and return a `NextResponse` with the appropriate HTTP status.
- **Client layer:** SWR surfaces errors via the `error` return value; display user-friendly messages via the i18n system.

```typescript
// Route handler pattern
try {
  const result = await service.execute(input);
  return NextResponse.json(result, { status: 200 });
} catch (error) {
  const domainError = error as DomainError;
  return NextResponse.json(
    { message: domainError.message },
    { status: domainError.statusCode ?? 500 },
  );
}
```

---

## State Management

- **Zustand** for global client-side UI state (stores live in `src/stores/`).
- **SWR** for server state / remote data — treat it as the source of truth for fetched data.
- Keep Zustand stores small and focused; avoid duplicating server state in Zustand.

---

## Validation

- Use **Zod 4** for all runtime validation of external inputs (API request bodies, environment variables, AI responses).
- Define schemas close to where they are used (e.g. alongside the inbound port DTO).
- Infer TypeScript types from Zod schemas with `z.infer<typeof MySchema>` rather than duplicating type definitions.

<!-- HEROUI-MIGRATION-AGENTS-MD-START -->

[HeroUI Migration Docs Index]|root: ./.heroui-docs/migration|STOP. Always search migration docs before migrating components from HeroUI v2 to v3.|Start with: agent-index.mdx, then follow the workflow and component guides.|If docs missing, run this command first: heroui agents-md --migration --output AGENTS.md|.:{agent-index.mdx,hooks.mdx,styling.mdx}|(components):{accordion.mdx,alert.mdx,autocomplete.mdx,avatar.mdx,badge.mdx,breadcrumbs.mdx,button-group.mdx,button.mdx,calendar.mdx,card.mdx,checkbox-group.mdx,checkbox.mdx,chip.mdx,circular-progress.mdx,code.mdx,date-picker.mdx,date-range-picker.mdx,dateinput.mdx,divider.mdx,drawer.mdx,dropdown.mdx,form.mdx,image.mdx,input-otp.mdx,input.mdx,kbd.mdx,link.mdx,listbox.mdx,modal.mdx,navbar.mdx,numberinput.mdx,pagination.mdx,popover.mdx,progress.mdx,radio-group.mdx,radio.mdx,range-calendar.mdx,scroll-shadow.mdx,select.mdx,skeleton.mdx,slider.mdx,snippet.mdx,spacer.mdx,spinner.mdx,switch.mdx,table.mdx,tabs.mdx,timeinput.mdx,toast.mdx,tooltip.mdx,user.mdx}|(migration-for-agents):{agent-skills.mdx,agents-md.mdx,mcp-server.mdx}|(workflows):{agent-guide-full.mdx,agent-guide-incremental.mdx}

<!-- HEROUI-MIGRATION-AGENTS-MD-END -->
