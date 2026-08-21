"use client";

import React, { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { HiPencil } from "react-icons/hi2";
import { TransactionType } from "@/app/api/domain/transaction/model/transaction.model";
import { formatCurrency } from "@/config/utils";
import { NumericFormat } from "react-number-format";
import {
  CHIP_ACTIVE_CLASS,
  CHIP_BASE_CLASS,
  CHIP_EXPENSE_AMOUNT_CLASS,
  CHIP_INCOME_AMOUNT_CLASS,
  CHIP_TRANSFER_AMOUNT_CLASS,
} from "../chipStyles";

export interface InlineAmountChipProps {
  amount: number;
  type: TransactionType;
  onAmountChange: (amount: number) => void;
  onInteraction: () => void;
}

/**
 * Morphs between a badged amount display and an inline numeric input.
 * See sdd/ai-draft-transaction-pipeline.md §2.4 (Amount row) / §4.2 (#7).
 */
export const InlineAmountChip: React.FC<InlineAmountChipProps> = ({
  amount,
  type,
  onAmountChange,
  onInteraction,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(String(amount ?? ""));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue(String(amount ?? ""));
  }, [amount]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const amountColorClass = clsx({
    [CHIP_EXPENSE_AMOUNT_CLASS]: type === TransactionType.EXPENSE,
    [CHIP_INCOME_AMOUNT_CLASS]: type === TransactionType.INCOME,
    [CHIP_TRANSFER_AMOUNT_CLASS]: type === TransactionType.TRANSFER,
  });
  const sign = type === TransactionType.EXPENSE ? "-" : "";

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
      className={clsx(CHIP_BASE_CLASS, amountColorClass)}
    >
      <span>
        {sign}
        {formatCurrency(Math.abs(amount ?? 0))}
      </span>
      <HiPencil className="text-[10px] opacity-70" />
    </button>
  );
};
