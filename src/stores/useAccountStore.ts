"use client";

import { create } from "zustand";
import { AccountModel } from "@/app/api/domain/account/model/account.model";

interface AccountState {
  accounts: AccountModel[];
  isLoading: boolean;
  error: string | null;

  setAccounts: (accounts: AccountModel[]) => void;
  addAccount: (account: AccountModel) => void;
  updateAccount: (id: string, updates: Partial<AccountModel>) => void;
  removeAccount: (id: string) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
  fetchAccounts: () => Promise<void>;
}

export const useAccountStore = create<AccountState>()((set) => ({
  accounts: [],
  isLoading: false,
  error: null,

  setAccounts: (accounts) => set({ accounts }),

  addAccount: (account) =>
    set((state) => ({
      accounts: [...state.accounts, account],
    })),

  updateAccount: (id, updates) =>
    set((state) => ({
      accounts: state.accounts.map((account) =>
        account.id === id ? { ...account, ...updates } : account
      ),
    })),

  removeAccount: (id) =>
    set((state) => ({
      accounts: state.accounts.filter((account) => account.id !== id),
    })),

  setIsLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  reset: () =>
    set({
      accounts: [],
      isLoading: false,
      error: null,
    }),

  fetchAccounts: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch("/api/account");
      if (!response.ok) {
        throw new Error("Failed to fetch accounts");
      }
      const data = await response.json();
      set({ accounts: data.data || data });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      set({ isLoading: false });
    }
  },
}));
