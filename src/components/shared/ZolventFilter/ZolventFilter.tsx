import { Button, Form } from "@heroui/react";
import { TFunction } from "i18next";
import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useMemo,
  useEffect,
  useRef,
  useCallback,
  SyntheticEvent,
  lazy,
  Suspense,
  useState,
} from "react";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useZolventFilterStore } from "@/stores/useZolventFilterStore";

const ZolventFilterModalContainer = lazy(() => import("./ModalContainer"));
const ZolventFilterDrawerContainer = lazy(() => import("./DrawerContainer"));

export interface ZolventFilters {
  freeText?: string;
  account?: string;
  startDate?: string;
  endDate?: string;
  dateRangeKey?: string;
}

export interface ZolventFilterGroup {
  id: string;
  keys: (keyof ZolventFilters)[];
  isActive: (values: ZolventFilters, defaults: ZolventFilters) => boolean;
}

// Groups are keyed to how each filter type works, not to a specific page,
// so they live here instead of being supplied per-page.
const FILTER_GROUPS: ZolventFilterGroup[] = [
  {
    id: "freeText",
    keys: ["freeText"],
    isActive: (values) => Boolean(values.freeText),
  },
  {
    id: "account",
    keys: ["account"],
    isActive: (values) => Boolean(values.account),
  },
  {
    id: "dateRange",
    keys: ["startDate", "endDate", "dateRangeKey"],
    isActive: (values, defaults) =>
      values.startDate !== defaults.startDate ||
      values.endDate !== defaults.endDate,
  },
];

interface ZolventFilterProps extends PropsWithChildren {
  t: TFunction;
  storageKey: string;
  defaultFilterValues?: ZolventFilters;
  onFilter: (filters: ZolventFilters) => void;
}

interface ZolventFilterContextValue {
  t: TFunction;
  isFilterOpen: boolean;
  setIsFilterOpen: (isOpen: boolean) => void;
  draftFilters: ZolventFilters;
  setDraftFilters: (patch: Partial<ZolventFilters>) => void;
  appliedFilters: ZolventFilters;
  applyFilters: () => void;
  resetFilters: () => void;
  activeFilterCount: number;
}

const ZolventFilterContext = createContext<
  ZolventFilterContextValue | undefined
>(undefined);

// Helper hook to consume context safely
export function useZolventFilterContext() {
  const context = useContext(ZolventFilterContext);
  if (!context) {
    throw new Error(
      "ZolventFilter Filter must be rendered within a <ZolventFilter /> wrapper.",
    );
  }
  return context;
}

const ZolventFilterRoot: React.FC<ZolventFilterProps> = ({
  t,
  storageKey,
  defaultFilterValues,
  onFilter,
  children,
}) => {
  const persistedFilters = useZolventFilterStore(
    (state) => state.filtersByKey[storageKey],
  );
  const setPersistedFilters = useZolventFilterStore(
    (state) => state.setFilters,
  );

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<ZolventFilters>(
    () => defaultFilterValues ?? {},
  );
  const [draftFiltersState, setDraftFiltersState] = useState<ZolventFilters>(
    () => defaultFilterValues ?? {},
  );

  // Fire once immediately so parents get real values (defaults or persisted)
  // instead of waiting for the user's first submit.
  const didFireInitialRef = useRef(false);
  useEffect(() => {
    if (didFireInitialRef.current) return;
    didFireInitialRef.current = true;
    onFilter(appliedFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Zustand's persist middleware rehydrates from localStorage after the
  // initial render; when it lands, adopt it as the source of truth.
  const didHydrateRef = useRef(false);
  useEffect(() => {
    if (didHydrateRef.current || persistedFilters === undefined) return;
    didHydrateRef.current = true;
    setAppliedFilters(persistedFilters);
    setDraftFiltersState(persistedFilters);
    onFilter(persistedFilters);
  }, [persistedFilters, onFilter]);

  // Discard unapplied edits whenever the panel is (re)opened, so it always
  // reflects what's actually filtering the data.
  const wasOpenRef = useRef(false);
  useEffect(() => {
    if (isFilterOpen && !wasOpenRef.current) {
      setDraftFiltersState(appliedFilters);
    }
    wasOpenRef.current = isFilterOpen;
  }, [isFilterOpen, appliedFilters]);

  const draftFilters = draftFiltersState;

  const setDraftFilters = useCallback((patch: Partial<ZolventFilters>) => {
    setDraftFiltersState((prev) => ({ ...prev, ...patch }));
  }, []);

  const commitFilters = useCallback(
    (values: ZolventFilters) => {
      setAppliedFilters(values);
      setPersistedFilters(storageKey, values);
      onFilter(values);
      setIsFilterOpen(false);
    },
    [onFilter, setPersistedFilters, storageKey],
  );

  const applyFilters = useCallback(() => {
    commitFilters(draftFilters);
  }, [commitFilters, draftFilters]);

  const resetFilters = useCallback(() => {
    const defaults = defaultFilterValues ?? {};
    setDraftFiltersState(defaults);
    commitFilters(defaults);
  }, [commitFilters, defaultFilterValues]);

  const activeFilterCount = useMemo(() => {
    const defaults = defaultFilterValues ?? {};
    return FILTER_GROUPS.filter((group) =>
      group.isActive(appliedFilters, defaults),
    ).length;
  }, [appliedFilters, defaultFilterValues]);

  const contextValue = useMemo<ZolventFilterContextValue>(
    () => ({
      t,
      isFilterOpen,
      setIsFilterOpen,
      draftFilters,
      setDraftFilters,
      appliedFilters,
      applyFilters,
      resetFilters,
      activeFilterCount,
    }),
    [
      t,
      isFilterOpen,
      draftFilters,
      setDraftFilters,
      appliedFilters,
      applyFilters,
      resetFilters,
      activeFilterCount,
    ],
  );

  return (
    <ZolventFilterContext.Provider value={contextValue}>
      {children}
    </ZolventFilterContext.Provider>
  );
};

const ZolventFilterContainer: React.FC<PropsWithChildren> = ({ children }) => {
  const { t, applyFilters, resetFilters } = useZolventFilterContext();
  const isMobile = useIsMobile();
  const Container = isMobile
    ? ZolventFilterDrawerContainer
    : ZolventFilterModalContainer;

  const onSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    applyFilters();
  };

  return (
    <Container>
      <div className="mt-3">
        <Form className="flex flex-col gap-2" onSubmit={onSubmit}>
          <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>

          <div className="flex flex-row w-full items-center justify-end gap-2 pt-4">
            <Button type="button" variant="secondary" onPress={resetFilters}>
              {t("reset")}
            </Button>
            <Button type="submit">{t("filter")}</Button>
          </div>
        </Form>
      </div>
    </Container>
  );
};

export const ZolventFilter = Object.assign(ZolventFilterRoot, {
  Container: ZolventFilterContainer,
  AccountFilter: React.lazy(() =>
    import("./Filters/AccountFIlter").then((module) => ({
      default: module.AccountFilter,
    })),
  ),
  FreeTextFilter: React.lazy(() =>
    import("./Filters/FreeTextFIlter").then((module) => ({
      default: module.FreeTextFilter,
    })),
  ),
  DateRangeFilter: React.lazy(() =>
    import("./Filters/DateRangeFilter").then((module) => ({
      default: module.DateRangeFilter,
    })),
  ),
});
