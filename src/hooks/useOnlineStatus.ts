"use client";

import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";
import { useToast } from "@/hooks/useToast";
import { useOnlineStore } from "@/stores/useOnlineStore";

// Reads from a store populated once by OnlineStatusListener (mounted at the
// app root) rather than tracking its own state — every consumer must share
// the same isOnline value regardless of when/whether it individually mounts.
export function useOnlineStatus() {
  const isOnline = useOnlineStore((state) => state.isOnline);

  return { isOnline };
}

/**
 * Guards mutations against running while offline. Blocks the write and
 * surfaces a visible alert instead of queueing it — no offline write queue,
 * no sync-conflict resolution (see docs/OFFLINE_FIRST.md).
 */
export function useOfflineWriteGuard() {
  const { isOnline } = useOnlineStatus();
  const { showErrorToast } = useToast();
  const { t } = useTranslation(LocaleNamespace.Common);

  return function guardOnline(): boolean {
    if (isOnline) return true;

    showErrorToast({
      title: t("offline.writeBlockedTitle"),
      description: t("offline.writeBlockedDescription"),
    });

    return false;
  };
}
