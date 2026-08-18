"use client";

import { useAuthUserStore } from "@/stores/useAuthUserStore";

// Reads from a store populated once by AuthUserInfoProvider (mounted at the
// app root) rather than tracking its own state — every consumer must share
// the same user value regardless of when/whether it individually mounts.
export function useAuthUser() {
  return useAuthUserStore((state) => state.user);
}
