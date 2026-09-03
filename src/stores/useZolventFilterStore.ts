import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { ZolventFilters } from "@/components/shared/ZolventFilter/ZolventFilter";

interface ZolventFilterState {
  filtersByKey: Record<string, ZolventFilters>;
  setFilters: (storageKey: string, values: ZolventFilters) => void;
}

export const useZolventFilterStore = create<ZolventFilterState>()(
  persist(
    (set) => ({
      filtersByKey: {},
      setFilters: (storageKey, values) =>
        set((state) => ({
          filtersByKey: { ...state.filtersByKey, [storageKey]: values },
        })),
    }),
    {
      name: "zolvent-filters-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
