"use client";

import { create } from "zustand";
import { UserSettings } from "@/interfaces/user";

interface UserSettingsState {
  settings: UserSettings | undefined;
  isLoading: boolean;

  setSettings: (settings: UserSettings | undefined) => void;
  setIsLoading: (isLoading: boolean) => void;
  reset: () => void;
}

export const useUserSettingsStore = create<UserSettingsState>()((set) => ({
  settings: undefined,
  isLoading: true,

  setSettings: (settings) => set({ settings }),

  setIsLoading: (isLoading) => set({ isLoading }),

  reset: () =>
    set({
      settings: undefined,
      isLoading: true,
    }),
}));
