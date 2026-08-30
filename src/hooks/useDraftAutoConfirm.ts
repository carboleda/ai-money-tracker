"use client";

import { useEffect } from "react";
import {
  useTransactionDraftStore,
  AUTO_CONFIRM_SECONDS,
} from "@/stores/useTransactionDraftStore";

/**
 * Drives the 5-second auto-confirm countdown for high-confidence AI drafts
 * (see sdd/ai-draft-transaction-pipeline.md §2.5). Ticks down
 * `autoConfirmCountdown` every second while `isAutoConfirmActive` is true,
 * and invokes `onAutoConfirm` once the countdown reaches zero.
 *
 * Reads/writes the store imperatively via `getState()` inside the interval
 * callback to avoid stale closures, while keeping the effect's dependency
 * array limited to `isAutoConfirmActive` so the timer isn't recreated every
 * tick.
 */
export const useDraftAutoConfirm = (onAutoConfirm: () => void) => {
  const isAutoConfirmActive = useTransactionDraftStore(
    (s) => s.isAutoConfirmActive
  );

  useEffect(() => {
    if (!isAutoConfirmActive) return;

    const intervalId = setInterval(() => {
      const { autoConfirmCountdown, cancelAutoConfirm } =
        useTransactionDraftStore.getState();

      if (autoConfirmCountdown <= 1) {
        cancelAutoConfirm();
        onAutoConfirm();
        return;
      }

      useTransactionDraftStore.setState({
        autoConfirmCountdown: autoConfirmCountdown - 1,
      });
    }, 1000);

    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAutoConfirmActive]);

  return {
    isAutoConfirmActive,
    autoConfirmCountdown: useTransactionDraftStore(
      (s) => s.autoConfirmCountdown
    ),
    totalSeconds: AUTO_CONFIRM_SECONDS,
  };
};
