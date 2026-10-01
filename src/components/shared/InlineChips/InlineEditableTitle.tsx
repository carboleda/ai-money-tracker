"use client";

import React, { useEffect, useRef, useState } from "react";
import { HiPencil } from "react-icons/hi2";
import clsx from "clsx";

export interface InlineEditableTitleProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  isRequired?: boolean;
  onInteraction?: () => void;
}

/**
 * Inline-editable title: click-to-edit text, commits on blur/Enter/Tab,
 * reverts on Escape.
 */
export const InlineEditableTitle: React.FC<InlineEditableTitleProps> = ({
  value,
  onChange,
  placeholder,
  isRequired = false,
  onInteraction = () => {},
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const commit = () => {
    setIsEditing(false);
    if (draft.trim() && draft !== value) {
      onChange(draft.trim());
    } else {
      setDraft(value);
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
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === "Tab") {
            e.preventDefault();
            commit();
          }
          if (e.key === "Escape") {
            e.preventDefault();
            setDraft(value);
            setIsEditing(false);
          }
        }}
        className="w-full bg-transparent border-0 outline-none text-foreground text-lg font-semibold placeholder:text-muted"
        placeholder={placeholder}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={startEditing}
      className="group flex items-center gap-1.5 text-left text-foreground text-lg font-semibold cursor-text"
    >
      <span className={clsx(!value && "text-muted font-normal")}>
        {value || placeholder}
      </span>
      {isRequired && !value && <span className="text-danger">*</span>}
      <HiPencil className="text-sm" />
    </button>
  );
};
