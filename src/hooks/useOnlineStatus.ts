"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";
import { useToast } from "@/hooks/useToast";

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    () => typeof navigator === "undefined" || navigator.onLine
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

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
