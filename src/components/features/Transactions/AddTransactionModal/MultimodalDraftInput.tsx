"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import { Button } from "@heroui/react";
import {
  HiArrowUp,
  HiMicrophone,
  HiOutlineCamera,
  HiOutlineMicrophone,
  HiOutlineSparkles,
  HiXMark,
} from "react-icons/hi2";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";
import { useTransactionDraftStore } from "@/stores/useTransactionDraftStore";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { VoiceRecordingBar } from "./VoiceRecordingBar";

export interface MultimodalDraftInputProps {
  isParsing: boolean;
  onSubmit: (input: { text?: string; picture?: string }) => void;
  onInteraction: () => void;
  onMicPermissionDenied?: (isDenied: boolean) => void;
}

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

/**
 * Natural-language prompt textarea + receipt photo capture/upload/drag-drop.
 * See sdd/ai-draft-transaction-pipeline.md §2.3 (Multimodal Input Spec) /
 * §4.2 (#8).
 */
export const MultimodalDraftInput: React.FC<MultimodalDraftInputProps> = ({
  isParsing,
  onSubmit,
  onInteraction,
  onMicPermissionDenied,
}) => {
  const { t } = useTranslation(LocaleNamespace.Transactions);
  const { isOnline } = useOnlineStatus();
  const isMobile = useIsMobile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const prompt = useTransactionDraftStore((s) => s.prompt);
  const setPrompt = useTransactionDraftStore((s) => s.setPrompt);
  const receiptPreviewUrl = useTransactionDraftStore(
    (s) => s.receiptPreviewUrl
  );
  const setReceiptImage = useTransactionDraftStore((s) => s.setReceiptImage);

  const isDisabled = !isOnline || isParsing;

  const {
    isSupported,
    isListening,
    permissionError,
    startListening,
    stopListening,
  } = useSpeechRecognition({
    onTranscriptChange: setPrompt,
  });

  useEffect(() => {
    onMicPermissionDenied?.(permissionError !== null);
  }, [permissionError, onMicPermissionDenied]);

  const beginVoiceInput = () => {
    onInteraction();
    if (prompt) setPrompt("");
    startListening();
  };

  // Mobile: press-and-hold. Holding a mouse button down is finicky, so
  // desktop uses a click-to-start/click-to-stop toggle instead (see
  // handleMicClick), and these pointer handlers are gated to touch/pen.
  // Pointer capture keeps every subsequent event routed to this button for
  // the duration of the gesture, even if the VoiceRecordingBar appearing
  // shifts layout under the still-held finger — without it, a reflow can
  // move the button out from under the touch point and the browser stops
  // delivering pointerup/pointerleave to it, leaving the recording stuck on.
  const handleMicPressStart = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!isMobile || e.pointerType === "mouse") return;
    e.preventDefault();
    if (isDisabled || isListening) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    navigator.vibrate?.(40);
    beginVoiceInput();
  };

  const handleMicPressEnd = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!isMobile || e.pointerType === "mouse" || !isListening) return;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    navigator.vibrate?.(40);
    stopListening();
  };

  const handleMicClick = () => {
    if (isMobile || isDisabled) return;
    if (isListening) {
      stopListening();
    } else {
      beginVoiceInput();
    }
  };

  const micAriaLabel = (() => {
    if (isMobile) {
      return t("aiDraft.voiceTrigger");
    }

    if (isListening) {
      return t("aiDraft.voiceStopTrigger");
    }

    return t("aiDraft.voiceClickTrigger");
  })();

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onInteraction();
    setPrompt(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit({ text: prompt });
    }
  };

  const handleFile = async (file?: File | null) => {
    if (!file) return;
    onInteraction();
    const dataUrl = await readFileAsDataUrl(file);
    setReceiptImage(dataUrl, dataUrl);
    setPrompt("");
    onSubmit({ picture: dataUrl });
  };

  const clearReceipt = () => {
    setReceiptImage(null, null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  return (
    <div
      className={clsx(
        "flex flex-col gap-2 rounded-2xl border border-border bg-surface p-3 transition-colors",
        isDragOver && "border-accent bg-surface-secondary"
      )}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={onDrop}
    >
      {receiptPreviewUrl ? (
        <div className="relative w-full">
          <Image
            src={receiptPreviewUrl}
            alt="Receipt preview"
            width={400}
            height={200}
            className="w-full max-h-40 object-cover rounded-xl"
          />
          <Button
            variant="ghost"
            isIconOnly
            size="sm"
            onPress={clearReceipt}
            aria-label="Remove receipt"
            className="absolute top-2 right-2 rounded-full bg-overlay text-overlay-foreground"
          >
            <HiXMark />
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex items-start gap-2">
            <textarea
              value={prompt}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              disabled={isDisabled || isListening}
              rows={2}
              placeholder={t("aiDraft.promptPlaceholder")}
              className="flex-1 h-full resize-none bg-transparent border-0 outline-none text-foreground placeholder:text-muted text-sm disabled:opacity-50"
            />
            {!isListening && prompt.trim() && (
              <Button
                variant="primary"
                isIconOnly
                size="sm"
                aria-label={t("aiDraft.submitPrompt")}
                isDisabled={isDisabled}
                onPress={() => onSubmit({ text: prompt })}
                className="shrink-0"
              >
                <HiArrowUp className="text-lg" />
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <VoiceRecordingBar
              className={clsx(
                "min-w-0 flex-1 transition-opacity duration-150",
                isListening
                  ? "opacity-100"
                  : "invisible opacity-0 pointer-events-none"
              )}
            />
            <div className="flex shrink-0 items-center gap-2">
              {!isListening && (
                <Button
                  variant="secondary"
                  isIconOnly
                  aria-label={t("aiDraft.cameraTrigger")}
                  isDisabled={isDisabled}
                  onPress={() => {
                    onInteraction();
                    fileInputRef.current?.click();
                  }}
                >
                  <HiOutlineCamera className="text-lg" />
                </Button>
              )}
              {isSupported && (
                <Button
                  variant="secondary"
                  isIconOnly
                  aria-label={micAriaLabel}
                  isDisabled={isDisabled}
                  onPress={handleMicClick}
                  onPointerDown={handleMicPressStart}
                  onPointerUp={handleMicPressEnd}
                  onPointerCancel={handleMicPressEnd}
                  onPointerLeave={handleMicPressEnd}
                  className={clsx(
                    "touch-none transition-transform",
                    isListening &&
                      "scale-105 border-danger bg-danger/20 text-danger animate-pulse"
                  )}
                >
                  {isListening ? (
                    <HiMicrophone className="text-lg" />
                  ) : (
                    <HiOutlineMicrophone className="text-lg" />
                  )}
                </Button>
              )}
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </div>
      )}

      {isParsing && (
        <div className="flex items-center gap-1.5 text-xs text-accent animate-pulse">
          <HiOutlineSparkles />
          <span>{t("aiDraft.parsing")}</span>
        </div>
      )}
    </div>
  );
};
