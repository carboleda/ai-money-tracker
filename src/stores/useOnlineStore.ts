import { create } from "zustand";

interface OnlineState {
  isOnline: boolean;
  setIsOnline: (isOnline: boolean) => void;
}

// Assume online until OnlineStatusListener (mounted once at the app root)
// corrects it after mount — navigator.onLine can't be read during SSR and
// mustn't diverge from the server's first-render HTML, or React flags a
// hydration mismatch.
export const useOnlineStore = create<OnlineState>()((set) => ({
  isOnline: true,
  setIsOnline: (isOnline) => set({ isOnline }),
}));
