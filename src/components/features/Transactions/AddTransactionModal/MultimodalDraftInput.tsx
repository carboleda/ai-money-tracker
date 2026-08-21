"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import { Button } from "@heroui/react";
import { HiOutlineCamera, HiOutlineSparkles, HiXMark } from "react-icons/hi2";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";
import { useTransactionDraftStore } from "@/stores/useTransactionDraftStore";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

export interface MultimodalDraftInputProps {
  isParsing: boolean;
  onSubmit: (input: { text?: string; picture?: string }) => void;
  onInteraction: () => void;
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
}) => {
  const { t } = useTranslation(LocaleNamespace.Transactions);
  const { isOnline } = useOnlineStatus();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const prompt = useTransactionDraftStore((s) => s.prompt);
  const setPrompt = useTransactionDraftStore((s) => s.setPrompt);
  const receiptPreviewUrl = useTransactionDraftStore(
    (s) => s.receiptPreviewUrl
  );
  const setReceiptImage = useTransactionDraftStore((s) => s.setReceiptImage);

  const isDisabled = !isOnline || isParsing;

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
    onSubmit({ picture: dataUrl, text: prompt });
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
        <div className="flex items-start gap-2">
          <textarea
            value={prompt}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            disabled={isDisabled}
            rows={2}
            placeholder={t("aiDraft.promptPlaceholder")}
            className="flex-1 resize-none bg-transparent border-0 outline-none text-foreground placeholder:text-muted text-sm disabled:opacity-50"
          />
          <Button
            variant="secondary"
            isIconOnly
            aria-label={t("aiDraft.cameraTrigger")}
            isDisabled={isDisabled}
            onPress={() => {
              onInteraction();
              fileInputRef.current?.click();
            }}
            className="shrink-0"
          >
            <HiOutlineCamera className="text-lg" />
          </Button>
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
