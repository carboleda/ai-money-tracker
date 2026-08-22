"use client";

import React, { useEffect, useRef, useState } from "react";
import { HiPencil } from "react-icons/hi2";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";
import clsx from "clsx";

export interface InlineDescriptionTitleProps {
  description: string;
  onDescriptionChange: (description: string) => void;
  onInteraction: () => void;
}

/**
 * Inline-editable AI draft summary title.
 * See sdd/ai-draft-transaction-pipeline.md §2.4 (#1) / §4.2 (#2).
 */
export const InlineDescriptionTitle: React.FC<InlineDescriptionTitleProps> = ({
  description,
  onDescriptionChange,
  onInteraction,
}) => {
  const { t } = useTranslation(LocaleNamespace.Transactions);
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(description);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue(description);
  }, [description]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const commit = () => {
    setIsEditing(false);
    if (value.trim() && value !== description) {
      onDescriptionChange(value.trim());
    } else {
      setValue(description);
    }
  };

  const startEditing = () => {
    onInteraction();
    setIsEditing(true);
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === "Tab") {
            e.preventDefault();
            commit();
          }
          if (e.key === "Escape") {
            e.preventDefault();
            setValue(description);
            setIsEditing(false);
          }
        }}
        className="w-full bg-transparent border-0 outline-none text-foreground text-lg font-semibold placeholder:text-muted"
        placeholder={t("aiDraft.descriptionPlaceholder")}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={startEditing}
      className="group flex items-center gap-1.5 text-left text-foreground text-lg font-semibold cursor-text"
    >
      <span className={clsx(!description && "text-muted font-normal")}>
        {description || t("aiDraft.descriptionPlaceholder")}
      </span>
      <HiPencil className="text-sm" />
    </button>
  );
};
