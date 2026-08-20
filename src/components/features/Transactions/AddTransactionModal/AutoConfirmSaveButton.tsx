"use client";

import React from "react";
import clsx from "clsx";
import { Button } from "@heroui/react";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";
import { useIsMobile } from "@/hooks/useIsMobile";
import {
  useTransactionDraftStore,
  AUTO_CONFIRM_SECONDS,
} from "@/stores/useTransactionDraftStore";

export interface AutoConfirmSaveButtonProps {
  isDisabled?: boolean;
  isSaving?: boolean;
  onSave: () => void;
}

/**
 * Solid neon lime "Save" CTA with an animated 5-second countdown progress
 * layer for high-confidence AI drafts. Clicking anywhere on the button
 * (including the progress bar) pauses auto-confirm and saves immediately.
 * See sdd/ai-draft-transaction-pipeline.md §2.5 / §4.2 (#9).
 */
export const AutoConfirmSaveButton: React.FC<AutoConfirmSaveButtonProps> = ({
  isDisabled,
  isSaving,
  onSave,
}) => {
  const { t } = useTranslation(LocaleNamespace.Transactions);
  const isMobile = useIsMobile();
  const isAutoConfirmActive = useTransactionDraftStore(
    (s) => s.isAutoConfirmActive,
  );
  const autoConfirmCountdown = useTransactionDraftStore(
    (s) => s.autoConfirmCountdown,
  );
  const cancelAutoConfirm = useTransactionDraftStore(
    (s) => s.cancelAutoConfirm,
  );

  const progressPercent = isAutoConfirmActive
    ? ((AUTO_CONFIRM_SECONDS - autoConfirmCountdown) / AUTO_CONFIRM_SECONDS) *
      100
    : 0;

  const handlePress = () => {
    if (isAutoConfirmActive) cancelAutoConfirm();
    onSave();
  };

  return (
    <Button
      variant="primary"
      isPending={isSaving}
      isDisabled={isDisabled}
      onPress={handlePress}
      className="relative overflow-hidden bg-success font-semibold"
    >
      {isAutoConfirmActive && (
        <span
          aria-hidden
          className="absolute inset-0 transition-[width] duration-1000 ease-linear"
          style={{ width: `${progressPercent}%` }}
        />
      )}
      <span className="relative z-10">
        {t("aiDraft.save")}
        {isAutoConfirmActive && ` (${autoConfirmCountdown}s)`}
        {!isAutoConfirmActive && !isMobile && (
          <span className="ml-1 text-xs opacity-70">(Cmd+&#8629;)</span>
        )}
      </span>
    </Button>
  );
};
