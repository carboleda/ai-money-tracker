# HeroUI v2 → v3 Full Migration Plan

## Context

The project (`zolvent`) uses HeroUI v2 across 45 source files via ~26 per-component packages
(`@heroui/button`, `@heroui/modal`, `@heroui/table`, etc.). HeroUI v3 is a ground-up rewrite:
a single `@heroui/react` package, CSS-first styling (no Tailwind plugin), React Aria-based
compound components, a renamed color system (`primary` → `accent`, `secondary` removed), and
removed/renamed components and hooks. Prerequisites are already satisfied: Tailwind v4 (4.1.16)
and React 19 (19.2.0).

We are doing the **full migration workflow** (not incremental): migrate ALL component code to
v3 API patterns first — while still on v2 dependencies, accepting the app is broken during this
window — then switch dependencies to v3 in one final step, then migrate styling. All work stays
on a single feature branch. **We do NOT run `build` during migration** (`npm run build` runs the
SW env script + `next build`); we only run `npm run lint` (`next typegen && tsc --noEmit && eslint`)
at checkpoints. The app is verified via a production build only at the very end.

Decisions locked in with the user:
- `CategoriesAutocomplete` → v3 **ComboBox** (inline text filtering, closest to v2).
- `ThemeSwitch` → rebuild as a **plain `<button>` toggle** (it's just a sun/moon icon).
- **Checkpoint per phase** — pause for approval after each phase below.
- **Drop** the 4 unused packages (`navbar`, `accordion`, `progress`, `avatar`).

## Key facts from research

- Only 45 files in `src/` touch `@heroui/*` (104 import lines). Full inventory captured.
- 3 packages are imported but **missing from `package.json`** (transitive today): `@heroui/button`,
  `@heroui/checkbox`, `@heroui/spinner`. These get folded into `@heroui/react` at the dep switch.
- `onClick` → `onPress` is already ~done (22 files on `onPress`; only 2 stray `onClick=`).
- Widest surfaces: `Chip` (14 files), `Button` (26 files), `color=` prop (31 files / 53 sites),
  `Table` (10 files), `Modal` (8 files), `DatePicker` (5 files).
- Repeated per-feature pattern: Accounts / PendingTransaction / RecurringExpenses / Transactions
  each have `<Feature>Table.tsx` + `Columns.tsx` + `<Feature>ModalForm.tsx`. Migrate one, the
  rest follow the same template.
- Removed components (rebuild manually): `User`, `Image`, `Code`, `Navbar`. Renamed: `Autocomplete`→
  `ComboBox`, `Divider`→`Separator`, `Listbox`→`ListBox`.
- Removed hooks in use: `useSwitch` (ThemeSwitch), and `useDisclosure`→`useOverlayState`
  (NotificationsRequestModal only).

## Migration branch

Create `feat/heroui-v3-migration` from `main` at the start. All phases commit here.

---

## Phase 0 — Setup & shared wrappers (checkpoint)

Goal: migrate the reusable wrappers that every feature depends on, so feature phases are mechanical.

Files:
- `src/hooks/useToast.tsx` — rework onto v3's global `toast()` API. Keep the public surface
  (`showSuccessToast`/`showErrorToast`/`showConfirmDeleteToast`) unchanged so no call sites change.
  `addToast({color:"success"})` → `toast.success(...)`; `color:"danger"` → `toast.danger(...)`.
  Drop `radius`/`variant:"bordered"` (removed). Rebuild `showConfirmDeleteToast`'s `endContent`
  Button as a `Toast.ActionButton` (or custom compound render); `closeToast(key)` stays conceptually.
- `src/components/shared/ThemeSwitch.tsx` — replace `useSwitch` + `<Component>`/`getInputProps`
  with a plain `<button>` toggling `next-themes`; keep sun/moon icons, `aria-label`, `VisuallyHidden`
  not needed. Drop `SwitchProps`/`classNames` typing; accept plain `className`.
- `src/components/shared/ConfirmationModal.tsx` — migrate to v3 Modal compound
  (`Modal` → `Modal.Backdrop` → `Modal.Container` → `Modal.Dialog` → `Modal.Header`/`Body`/`Footer`).
  This is the template for all 6 feature modals. `isOpen`/`onOpenChange`→Backdrop, `size`→Container,
  `onClose`→Dialog `close` render prop.
- `src/components/shared/TableSkeleton.tsx` — v3 `Skeleton` no longer wraps children; switch to
  standalone placeholder + conditional rendering. This is the Skeleton template for all 6 consumers.
- `src/components/shared/MaskedCurrencyInput.tsx` — v3 `Input`/`TextField` compound;
  `startContent`/`endContent`→`InputGroup.Prefix`/`Suffix`; `onValueChange`→`onChange`.
- `src/components/shared/CustomDropdown.tsx` — v3 `Dropdown` compound (add required
  `Dropdown.Popover` wrapper; items need `id`+`textValue`, content in `Label`). Drop `cn` import
  from `@heroui/theme` (use local `clsx`). Template for the other 2 dropdown files.
- `src/components/shared/CustomDateRangePicker/index.tsx` — v3 `DateRangePicker` composition
  (DateField segments + Calendar + trigger). Drop `cn` from `@heroui/theme`.

Checkpoint: run `npm run lint` (expect v2/v3 type mismatches only where deps are still v2 — note,
do not fix by reverting), review wrapper diffs, then approve.

## Phase 1 — Leaf/shared components (checkpoint)

Simple, low-dependency components used broadly. Migrate by component type using the captured guides:

- **Chip** (14 files): variants 7→4 (`primary`/`secondary`/`tertiary`/`soft`); `color="primary"`→
  `accent`; `startContent`/`endContent`→children; `classNames`→`className`. Representative:
  `src/components/TransactionTypeDecorator.tsx`, `src/components/shared/DueDateIndicator.tsx`,
  `src/components/shared/NetworkIndicator.tsx`, all `Columns.tsx`.
- **Skeleton** consumers (5 remaining beyond TableSkeleton): `SummaryPanel.tsx`,
  `TransactionTypeDecorator.tsx`, `features/Summary/{AccountsBalanceTitle,Tiles,TransactionsByTypeTitle}.tsx`.
- **Divider→Separator** (3 files): rename import + JSX. `unauthorized/page.tsx`, `NotePopover.tsx`,
  `shared/Sidebar/Sidebar.tsx`.
- **Link** (1): `unauthorized/page.tsx` — `isExternal`→manual `target/rel`; `Link.Icon` child.
- **Spinner** (1): `TransactionInput.tsx` — single variant; `color="primary"`→`accent`.
- **Code** removed (2): `error.tsx`, `login/page.tsx` → native `<code>` + Tailwind classes.
- **Image** removed (2): `login/page.tsx`, `shared/Sidebar/Sidebar.tsx` → `next/image`.
- **User** removed (1): `UserAvatar.tsx` → compose `Avatar` compound (`Avatar.Image`+`Avatar.Fallback`)
  + text, per the guide's reusable pattern.
- **ListBox** (1): `shared/SidebarMenuItems.tsx` — rename; items need `id`+`textValue`.
- **Button** (26 files): `color`+`variant`→single `variant`; `color="danger" variant="flat"`→
  `danger-soft`; `isLoading`→`isPending`; `startContent`/`endContent`→children; add `min-w-*` where
  v2 min-width mattered. Mostly mechanical; do alongside the files above.
- **NotificationsRequestModal.tsx**: `useDisclosure`→`useOverlayState` (`onOpen`→`open`, `onClose`→
  `close`); `Checkbox` → v3 compound (`Checkbox.Content`/`Control`/`Indicator`); note the `ref` on
  checkbox — adapt to v3 API (read state via `onChange`/controlled value instead of reading `.checked`).

Checkpoint: `npm run lint`, review, approve.

## Phase 2 — Feature modules (checkpoint per group)

Migrate the four feature trios. Do **Transactions first** as the template (most complete: Table +
Columns + 3 modal forms + Tabs + DatePicker + ComboBox), then replicate for the others.

Per feature, migrate:
- **`<Feature>Table.tsx`** → v3 Table compound: `Table` → `Table.ScrollContainer` → `Table.Content`
  (carries `aria-label`/`selectionMode`/`sortDescriptor`/`onSortChange`) → `Table.Header`/`Column`/
  `Body`/`Row`/`Cell`. Rows use `id` (keep React `key`). `emptyContent`→`renderEmptyState` on Body;
  `bottomContent`→`Table.Footer`. Drop `color`/`isStriped`/`removeWrapper`/`classNames` → Tailwind.
- **`Columns.tsx`** → `TableCell`→`Table.Cell`, `TableRow`→`Table.Row`.
- **`<Feature>ModalForm.tsx`** → v3 Modal compound (per ConfirmationModal template) + migrated
  `Input`/`DatePicker`/`Chip`/`Button`/`Switch` inside.

Component specifics inside feature files:
- **DatePicker** (5 files) → v3 composition: `DatePicker` + `Label` + `DateField.Group`/`Input`/
  `Segment`/`Suffix` + `DatePicker.Trigger`/`TriggerIndicator` + `DatePicker.Popover`+`Calendar`.
  Files: `CompleteTransactionModalForm`, `RecurringExpenseModalForm`, `mode/FreeTextMode.tsx`,
  `UpdateTransactionModalForm/index.tsx`, and the range picker wrapper (Phase 0).
- **Tabs** (1, `CreateTransactionModalForm.tsx`) → v3 compound: `Tabs`→`Tabs.ListContainer`→
  `Tabs.List`→`Tabs.Tab`(id) + separate `Tabs.Panel`. `key`→`id`.
- **Switch** (3 feature files) → v3 compound (`Switch.Content`/`Control`/`Thumb`/`Icon`);
  `onValueChange`→`onChange`; `color`→Tailwind `data-[selected=true]:bg-*`.
- **Popover** (2: `NotePopover.tsx`, `AccountModalForm.tsx`) → `Popover`→`Popover.Content`→
  `Popover.Dialog` (+`Popover.Arrow` for `showArrow`).
- **Dropdown** (`FrequencyDropdown.tsx`) → v3 compound (per CustomDropdown template).
- **ComboBox** (`CategoriesAutocomplete.tsx`) → v3 ComboBox compound (`ComboBox.InputGroup`+`Input`+
  `ComboBox.Trigger`+`ComboBox.Popover`+`ListBox`); items `id`+`textValue`.
- **Chart tables** (`charts/CategoriesChart.tsx`, `charts/ChartDetailsModal.tsx`,
  `charts/TransactionsSummaryHistoryChart.tsx`) → Table/Modal/Switch as above.

Checkpoints: `npm run lint` + review after each feature group (Transactions, then Accounts,
PendingTransaction, RecurringExpenses, charts). Approve to proceed.

## Phase 3 — Provider, dependency switch & styling (final checkpoint)

Only after ALL code above is on v3 patterns:

1. **Providers** — `src/app/(ui)/providers.tsx`: remove `HeroUIProvider` (not needed in v3); the
   `navigate={router.push}` router integration is handled differently in v3 (React Aria RouterProvider
   or per-component navigation) — wire that up. Replace `<ToastProvider .../>` with `<Toast.Provider />`.
2. **package.json** — remove all `@heroui/*` per-component packages (including the 4 unused: navbar,
   accordion, progress, avatar) and the transitive-only ones; add `@heroui/react` + `@heroui/styles`.
   Keep `@react-aria/ssr`/`visually-hidden` only if still referenced (ThemeSwitch no longer needs them).
   Run install.
3. **Fix all imports** — swap every `@heroui/<pkg>` import to `@heroui/react`. Remove `@heroui/theme`
   `cn`/`heroui` imports.
4. **Styling** — `tailwind.config.js`: remove `plugins: [heroui()]` and the
   `node_modules/@heroui/theme` content glob (keep fontFamily/darkMode). `src/styles/globals.css`:
   add `@import "@heroui/styles";` after `@import "tailwindcss";`.
5. **Color/utility sweep** — global pass for `color="primary"`→accent variants, `bg-primary*`→
   `bg-accent*`, `content1-4`→`surface`/`overlay`, `text-small/tiny`→`text-sm/xs`,
   `rounded-small/medium/large`→`rounded-sm/md/lg` (note smaller v3 radii — use `rounded-[..px]`
   where exact v2 sizing matters), `border-small`→`border`. 31 files carry `color=`.

Final checkpoint: `npm run lint` must pass clean. Then run the real verification below.

---

## Verification (end of Phase 3)

1. `npm run lint` — clean (typegen + tsc + eslint).
2. `npm run build` — first build allowed; must succeed (runs `swEnvBuild.cjs` + `next build`).
3. `npm run start` — smoke-test in browser (per memory: offline-first/caching must be validated on
   the prod build, not `next dev`). Check golden paths:
   - Theme toggle (ThemeSwitch), light/dark, no flash of wrong theme on reload.
   - Toasts: success, error, and confirm-delete action button.
   - Each feature: table renders + sorting + empty state; modal forms open/submit/close;
     DatePicker + DateRangePicker; category ComboBox filtering; Tabs in create-transaction;
     switches; dropdowns; popovers (note editor, account color).
   - Sidebar (ListBox menu, avatar, images), login page, error/unauthorized pages.
   - Offline behavior + SW caching intact.
4. Visually diff radius/spacing/color against v2 (v3 defaults differ); apply arbitrary-value Tailwind
   where the design regressed.

## Notes / risks

- App is intentionally broken (type errors, runtime) between Phase 0 and the Phase 3 dep switch —
  expected for the full workflow. Lint is used to track surface area, not to gate green.
- v3 `navigate` router wiring is the highest-uncertainty item — confirm the v3 mechanism against
  `@heroui/react` docs during Phase 3 before finalizing providers.
- v3 toast's `showConfirmDeleteToast` action button + timeout progress may not map 1:1; if v3 lacks
  `shouldShowTimeoutProgress`, keep the action button and drop the progress affordance.
