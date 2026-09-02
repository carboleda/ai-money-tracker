import { Button, Form } from "@heroui/react";
import { TFunction } from "i18next";
import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useMemo,
  SyntheticEvent,
  lazy,
  Suspense,
  useState,
} from "react";
import { useIsMobile } from "@/hooks/useIsMobile";

const ZolventFilterModalContainer = lazy(() => import("./ModalContainer"));
const ZolventFilterDrawerContainer = lazy(() => import("./DrawerContainer"));

interface ZolventFilterProps extends PropsWithChildren {
  t: TFunction;
  activeFilterValues: ZolventFilters;
  onFilter: (filters: ZolventFilters) => void;
}

interface ZolventFilterContextValue extends ZolventFilterProps {
  isFilterOpen: boolean;
  setIsFilterOpen: (isOpen: boolean) => void;
}

export interface ZolventFilters {
  freeText?: string;
  account?: string;
  startDate?: string;
  endDate?: string;
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
  onFilter,
  children,
  activeFilterValues,
}) => {
  console.log("ZolventFilterRoot:filters", activeFilterValues);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const contextValue = useMemo(
    () => ({ isFilterOpen, setIsFilterOpen, onFilter, t, activeFilterValues }),
    [isFilterOpen, setIsFilterOpen, onFilter, t, activeFilterValues],
  );

  return (
    <ZolventFilterContext.Provider value={contextValue}>
      {children}
    </ZolventFilterContext.Provider>
  );
};

const ZolventFilterContainer: React.FC<PropsWithChildren> = ({ children }) => {
  const { t, onFilter, setIsFilterOpen } = useZolventFilterContext();
  const isMobile = useIsMobile();
  const Container = isMobile
    ? ZolventFilterDrawerContainer
    : ZolventFilterModalContainer;

  const onSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: Record<string, string> = {};
    // Convert FormData to plain object
    formData.forEach((value, key) => {
      data[key] =
        typeof value === "object" ? JSON.stringify(value) : value.toString();
    });
    // alert(`Form submitted with: ${JSON.stringify(data, null, 2)}`);
    onFilter(data);
    setIsFilterOpen(false);
  };

  return (
    <Container>
      <div className="mt-3">
        <Form className="flex flex-col gap-2" onSubmit={onSubmit}>
          <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>

          <div className="flex flex-row w-full items-center justify-end gap-2 pt-4">
            <Button type="reset" variant="secondary">
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
