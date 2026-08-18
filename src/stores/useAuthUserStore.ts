import { create } from "zustand";

export interface AuthUser {
  name?: string;
  picture?: string;
  email?: string;
}

interface AuthUserState {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
}

// Populated once by AuthUserInfoProvider (mounted at the app root) rather
// than tracked per-component — every consumer must share the same value
// regardless of when/whether it individually mounts (see useOnlineStore).
export const useAuthUserStore = create<AuthUserState>()((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
