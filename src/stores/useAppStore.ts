import { create } from "zustand";

interface AppState {
  isSidebarOpen: boolean;
  pageTitle: string;
  pageSubtitle: string;
  /**
   * When true, the Navbar replaces its menu button with a back button, for
   * pages with an in-place drill-down sub-view.
   */
  isBackButtonVisible: boolean;
  /**
   * Bumped every time the Navbar's back button is pressed. Pages with a
   * drill-down sub-view watch this in a `useEffect` and react by updating
   * their own local view state — no callback is stored in the store.
   */
  backPressCount: number;

  toggleSidebar: () => void;
  setPageTitle: (title: string, subtitle?: string) => void;
  setIsSidebarOpen: (open: boolean) => void;
  resetSidebar: () => void;
  setBackButtonVisible: (visible: boolean) => void;
  requestBack: () => void;
}

export const useAppStore = create<AppState>()((set) => ({
  isSidebarOpen: false,
  pageTitle: "Home",
  pageSubtitle: "",
  isBackButtonVisible: false,
  backPressCount: 0,

  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setPageTitle: (title: string, subtitle?: string) =>
    set({ pageTitle: title, pageSubtitle: subtitle ?? "" }),
  setIsSidebarOpen: (open: boolean) => set({ isSidebarOpen: open }),
  resetSidebar: () => set({ isSidebarOpen: false }),
  setBackButtonVisible: (visible: boolean) =>
    set({ isBackButtonVisible: visible }),
  requestBack: () => set((state) => ({ backPressCount: state.backPressCount + 1 })),
}));
