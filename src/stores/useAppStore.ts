import { create } from "zustand";

interface AppState {
  isSidebarOpen: boolean;
  pageTitle: string;
  pageSubtitle: string;

  toggleSidebar: () => void;
  setPageTitle: (title: string, subtitle?: string) => void;
  setIsSidebarOpen: (open: boolean) => void;
  resetSidebar: () => void;
}

export const useAppStore = create<AppState>()((set) => ({
  isSidebarOpen: false,
  pageTitle: "Home",
  pageSubtitle: "",

  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setPageTitle: (title: string, subtitle?: string) =>
    set({ pageTitle: title, pageSubtitle: subtitle ?? "" }),
  setIsSidebarOpen: (open: boolean) => set({ isSidebarOpen: open }),
  resetSidebar: () => set({ isSidebarOpen: false }),
}));
