"use client";

import React, { useMemo, useState } from "react";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { HiCheck, HiPencil } from "react-icons/hi2";
import { Env } from "@/config/env";
import { formatFrequency, getDaysInMonth } from "@/config/utils";
import { Frequency } from "@/interfaces/recurringExpense";
import {
  CHIP_ACTIVE_CLASS,
  CHIP_BASE_CLASS,
  CHIP_REQUIRED_EMPTY_CLASS,
} from "./chipStyles";
import { InlineSelectChip, InlineSelectOption } from "./InlineSelectChip";
import { Button } from "@heroui/react";

const FIXED_DATE = new Date(Env.NEXT_PUBLIC_FIXED_MONTH);
const FIXED_YEAR = FIXED_DATE.getFullYear();
const FIXED_MONTH_INDEX = FIXED_DATE.getMonth();
const FIXED_DAY = FIXED_DATE.getDate();

export interface InlineDueDateChipProps {
  frequency: Frequency;
  date?: Date;
  onDateChange: (date: Date) => void;
  isRequired?: boolean;
  placeholder: string;
  dayLabel: string;
  monthLabel: string;
  doneLabel: string;
  onInteraction?: () => void;
}

/**
 * Click-to-edit chip for recurring due dates: collapsed, it shows the
 * date formatted via formatFrequency (or `placeholder` when unset); editing,
 * it swaps in day/month selects (month only outside Monthly frequency) until
 * the done button collapses it back.
 */
export function InlineDueDateChip({
  frequency,
  date,
  onDateChange,
  isRequired = false,
  placeholder,
  dayLabel,
  monthLabel,
  doneLabel,
  onInteraction = () => {},
}: Readonly<InlineDueDateChipProps>) {
  const { i18n } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);

  const showMonth = frequency !== Frequency.MONTHLY;
  const displayLabel = date
    ? formatFrequency(frequency, date.toISOString())
    : placeholder;

  const activeMonthIndex = showMonth
    ? (date?.getMonth() ?? FIXED_MONTH_INDEX)
    : FIXED_MONTH_INDEX;
  const activeDay = date?.getDate() ?? FIXED_DAY;

  const monthOptions = useMemo<InlineSelectOption<string>[]>(() => {
    const formatter = new Intl.DateTimeFormat(i18n.language, {
      month: "long",
    });
    return Array.from({ length: 12 }, (_, monthIndex) => ({
      id: String(monthIndex),
      label: formatter.format(new Date(FIXED_YEAR, monthIndex, 1)),
    }));
  }, [i18n.language]);

  const dayOptions = useMemo<InlineSelectOption<string>[]>(() => {
    const daysInMonth = getDaysInMonth(FIXED_YEAR, activeMonthIndex);
    return Array.from({ length: daysInMonth }, (_, index) => {
      const day = index + 1;
      return { id: String(day), label: String(day) };
    });
  }, [activeMonthIndex]);

  const onDayChange = (dayValue: string) => {
    onDateChange(new Date(FIXED_YEAR, activeMonthIndex, Number(dayValue)));
  };

  const onMonthChange = (monthValue: string) => {
    const newMonthIndex = Number(monthValue);
    const clampedDay = Math.min(
      activeDay,
      getDaysInMonth(FIXED_YEAR, newMonthIndex),
    );
    onDateChange(new Date(FIXED_YEAR, newMonthIndex, clampedDay));
  };

  const startEditing = () => {
    onInteraction();
    setIsEditing(true);
  };

  const isEmpty = !date;

  if (isEditing) {
    return (
      <span className={clsx(CHIP_BASE_CLASS, "p-0!", CHIP_ACTIVE_CLASS)}>
        {showMonth && (
          <InlineSelectChip
            value={String(activeMonthIndex)}
            options={monthOptions}
            onChange={onMonthChange}
            ariaLabel={monthLabel}
            isRequired={isRequired}
          />
        )}
        <InlineSelectChip
          value={String(activeDay)}
          options={dayOptions}
          onChange={onDayChange}
          ariaLabel={dayLabel}
          isRequired={isRequired}
        />
        <Button
          isIconOnly
          variant="ghost"
          size="sm"
          aria-label={doneLabel}
          onClick={() => setIsEditing(false)}
          className="text-accent hover:opacity-80 p-1"
        >
          <HiCheck className="text-sm" />
        </Button>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={startEditing}
      className={clsx(
        CHIP_BASE_CLASS,
        isRequired && isEmpty && CHIP_REQUIRED_EMPTY_CLASS,
      )}
    >
      <span>{displayLabel}</span>
      <HiPencil className="text-[10px]" />
    </button>
  );
}
