"use client";

import React, { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { HiPencil } from "react-icons/hi2";
import {
  CHIP_ACTIVE_CLASS,
  CHIP_BASE_CLASS,
  CHIP_REQUIRED_EMPTY_CLASS,
} from "./chipStyles";

export interface InlineTextChipProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  icon?: string;
  multiline?: boolean;
  previewMaxLength?: number;
  isDisabled?: boolean;
  isRequired?: boolean;
  onInteraction?: () => void;
}

const truncate = (value: string, max: number) =>
  value.length > max ? `${value.slice(0, max)}…` : value;

/**
 * Click-to-edit chip for free-text fields. `multiline` swaps the edit
 * view's input for a textarea; both share the same commit/revert pattern.
 */
export const InlineTextChip: React.FC<InlineTextChipProps> = ({
  value,
  onChange,
  placeholder,
  icon,
  multiline = false,
  previewMaxLength = 24,
  isDisabled = false,
  isRequired = false,
  onInteraction = () => {},
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");
  const inputRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null);

  useEffect(() => {
    setDraft(value ?? "");
  }, [value]);

  useEffect(() => {
    if (isEditing) {
      const input = inputRef.current;
      if (!input) return;
      input.focus();
      const end = input.value.length;
      input.setSelectionRange(end, end);
    }
  }, [isEditing]);

  const commit = () => {
    setIsEditing(false);
    if (draft !== (value ?? "")) {
      onChange(draft);
    }
  };

  const revert = () => {
    setDraft(value ?? "");
    setIsEditing(false);
  };

  const startEditing = () => {
    if (isDisabled) return;
    onInteraction();
    setIsEditing(true);
  };

  const isEmpty = !value;

  if (isEditing) {
    return (
      <span
        className={clsx(
          CHIP_BASE_CLASS,
          CHIP_ACTIVE_CLASS,
          multiline && "items-start"
        )}
      >
        {multiline ? (
          <textarea
            ref={inputRef}
            rows={3}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.preventDefault();
                revert();
              }
            }}
            placeholder={placeholder}
            className="w-48 bg-transparent border-0 outline-none text-foreground resize-none"
          />
        ) : (
          <input
            ref={inputRef}
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commit();
              }
              if (e.key === "Escape") {
                e.preventDefault();
                revert();
              }
            }}
            placeholder={placeholder}
            className="w-32 bg-transparent border-0 outline-none text-foreground"
          />
        )}
      </span>
    );
  }

  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={startEditing}
      className={clsx(
        CHIP_BASE_CLASS,
        isDisabled && "opacity-50 cursor-not-allowed",
        isRequired && isEmpty && CHIP_REQUIRED_EMPTY_CLASS
      )}
    >
      {icon && <span>{icon}</span>}
      <span className={clsx(isEmpty && "text-muted")}>
        {value ? truncate(value, previewMaxLength) : placeholder}
      </span>
      {!isDisabled && <HiPencil className="text-[10px]" />}
    </button>
  );
};
