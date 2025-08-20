import { create } from "zustand";

interface AppState {
  isSidebarOpen: boolean;
  pageTitle: string;

  toggleSidebar: () => void;
  setPageTitle: (title: string) => void;
  setIsSidebarOpen: (open: boolean) => void;
  resetSidebar: () => void;
}

export const useAppStore = create<AppState>()((set) => ({
  isSidebarOpen: false,
  pageTitle: "Home",

  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setPageTitle: (title: string) => set({ pageTitle: title }),
  setIsSidebarOpen: (open: boolean) => set({ isSidebarOpen: open }),
  resetSidebar: () => set({ isSidebarOpen: false }),
}));
