"use client";

import React, { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { HiPencil } from "react-icons/hi2";
import { NumericFormat } from "react-number-format";
import { formatCurrency } from "@/config/utils";
import {
  CHIP_ACTIVE_CLASS,
  CHIP_BASE_CLASS,
  CHIP_REQUIRED_EMPTY_CLASS,
} from "./chipStyles";

export interface InlineAmountChipProps {
  amount?: number;
  colorClassName?: string;
  sign?: "" | "-";
  isRequired?: boolean;
  onAmountChange: (amount: number) => void;
  onInteraction?: () => void;
}

/**
 * Morphs between a badged amount display and an inline numeric input.
 */
export const InlineAmountChip: React.FC<InlineAmountChipProps> = ({
  amount,
  colorClassName = "",
  sign = "",
  isRequired = false,
  onAmountChange,
  onInteraction = () => {},
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(String(amount ?? ""));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue(String(amount ?? ""));
  }, [amount]);

  useEffect(() => {
    if (isEditing) {
      const input = inputRef.current;
      if (!input) return;
      input.focus();
      const end = input.value.length;
      input.setSelectionRange(end, end);
    }
  }, [isEditing]);

  const isEmpty = amount === 0 || amount == null;

  const commit = () => {
    setIsEditing(false);
    const parsed = Number.parseFloat(value);
    if (!Number.isNaN(parsed) && parsed !== amount) {
      onAmountChange(parsed);
    } else {
      setValue(String(amount ?? ""));
    }
  };

  const startEditing = () => {
    onInteraction();
    setIsEditing(true);
  };

  if (isEditing) {
    return (
      <span className={clsx(CHIP_BASE_CLASS, CHIP_ACTIVE_CLASS)}>
        <span className="text-muted">$</span>
        <NumericFormat
          getInputRef={inputRef}
          thousandSeparator={true}
          decimalSeparator="."
          decimalScale={2}
          fixedDecimalScale={false}
          prefix="$"
          value={value}
          onValueChange={(v) => setValue(v.floatValue?.toString() ?? "")}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit();
            }
            if (e.key === "Escape") {
              e.preventDefault();
              setValue(String(amount ?? ""));
              setIsEditing(false);
            }
          }}
          className="w-20 bg-transparent border-0 outline-none text-foreground"
        />
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={startEditing}
      className={clsx(
        CHIP_BASE_CLASS,
        colorClassName,
        isRequired && isEmpty && CHIP_REQUIRED_EMPTY_CLASS
      )}
    >
      <span>
        {sign}
        {formatCurrency(Math.abs(amount ?? 0))}
      </span>
      <HiPencil className="text-[10px]" />
    </button>
  );
};
