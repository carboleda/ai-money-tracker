"use client";

import React from "react";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";
import { useIsMobile } from "@/hooks/useIsMobile";

export interface VoiceRecordingBarProps {
  className?: string;
}

const WAVE_BAR_IDS = Array.from(
  { length: 10 },
  (_, i) => `wave-bar-${i}`
);

/**
 * Dedicated recording feedback bar shown while SpeechRecognition is active.
 * Copy differs by input model: press-and-hold on mobile, click-to-stop on
 * desktop. See sdd/voice-transaction-input.md §2.1 / §5.
 */
export const VoiceRecordingBar: React.FC<VoiceRecordingBarProps> = ({
  className,
}) => {
  const { t } = useTranslation(LocaleNamespace.Transactions);
  const isMobile = useIsMobile();

  return (
    <div
      className={clsx(
        "flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-surface-secondary border border-border text-xs",
        className,
      )}
    >
      <div className="flex items-center gap-2 font-medium text-danger">
        <span className="h-2 w-2 shrink-0 rounded-full bg-danger animate-pulse" />
        <span>
          {isMobile
            ? t("aiDraft.voiceListening")
            : t("aiDraft.voiceListeningDesktop")}
        </span>
      </div>
      <div className="flex items-center gap-0.5 h-4 shrink-0">
        {WAVE_BAR_IDS.map((id, index) => (
          <div
            key={id}
            className="w-1 h-full rounded-full bg-accent animate-wave-pulse"
            style={{ animationDelay: `${index * 0.12}s` }}
          />
        ))}
      </div>
      <span className="text-muted whitespace-nowrap">
        {isMobile
          ? t("aiDraft.voiceReleaseToFinish")
          : t("aiDraft.voiceClickToStop")}
      </span>
    </div>
  );
};
