"use client";

import { create } from "zustand";
import { CategoryOutput } from "@/app/api/domain/category/ports/outbound/get-categories.port";

interface CategoryState {
  categories: CategoryOutput[];
  isLoading: boolean;
  error: string | null;

  setCategories: (categories: CategoryOutput[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useCategoryStore = create<CategoryState>()((set) => ({
  categories: [],
  isLoading: false,
  error: null,

  setCategories: (categories) => set({ categories }),

  setIsLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  reset: () =>
    set({
      categories: [],
      isLoading: false,
      error: null,
    }),
}));
