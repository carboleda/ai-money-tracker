"use client";

import React, { useMemo, useState } from "react";
import { Button, Popover } from "@heroui/react";
import { CustomDateField } from "@/components/shared/CustomDateField";
import { CustomTimeField } from "@/components/shared/CustomTimeField";
import { CHIP_BASE_CLASS, CHIP_REQUIRED_EMPTY_CLASS } from "./chipStyles";
import clsx from "clsx";

export interface InlineDateTimeChipProps {
  date: Date;
  onDateChange: (date: Date) => void;
  showTime?: boolean;
  minValue?: Date;
  maxValue?: Date;
  isRequired?: boolean;
  showQuickPicks?: boolean;
  todayLabel: string;
  yesterdayLabel: string;
  customDateLabel: string;
  customTimeLabel: string;
  onInteraction?: () => void;
}

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/**
 * Popover-based date (& optionally time) chip with Today/Yesterday quick
 * picks plus a custom date (and time) field.
 */
export const InlineDateTimeChip: React.FC<InlineDateTimeChipProps> = ({
  date,
  onDateChange,
  showTime = true,
  minValue,
  maxValue,
  isRequired = false,
  showQuickPicks = true,
  todayLabel,
  yesterdayLabel,
  customDateLabel,
  customTimeLabel,
  onInteraction = () => {},
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const label = useMemo(() => {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    const time = showTime
      ? date.toLocaleTimeString(undefined, {
          hour: "numeric",
          minute: "2-digit",
        })
      : undefined;

    if (isSameDay(date, now)) {
      return `📅 ${todayLabel}` + (time ? `, ${time}` : "");
    }

    if (isSameDay(date, yesterday)) {
      return `📅 ${yesterdayLabel}` + (time ? `, ${time}` : "");
    }

    const dateLabel = date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    return `📅 ${dateLabel}` + (time ? `, ${time}` : "");
  }, [date, showTime, todayLabel, yesterdayLabel]);

  const onOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) onInteraction();
  };

  const setQuickDay = (offsetDays: number) => {
    const next = new Date();
    next.setDate(next.getDate() + offsetDays);
    if (showTime) {
      next.setHours(date.getHours(), date.getMinutes(), 0, 0);
    } else {
      next.setHours(0, 0, 0, 0);
    }
    onDateChange(next);
  };

  return (
    <Popover isOpen={isOpen} onOpenChange={onOpenChange}>
      <Button
        variant="ghost"
        className={clsx(
          CHIP_BASE_CLASS,
          isRequired && !date && CHIP_REQUIRED_EMPTY_CLASS,
        )}
      >
        {label} ▾
      </Button>
      <Popover.Content placement="bottom">
        <Popover.Dialog>
          <Popover.Arrow />
          <div className="flex flex-col gap-3 p-1">
            {showQuickPicks && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onPress={() => setQuickDay(0)}
                >
                  {todayLabel}
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onPress={() => setQuickDay(-1)}
                >
                  {yesterdayLabel}
                </Button>
              </div>
            )}
            <CustomDateField
              id="inline-date-input"
              label={customDateLabel}
              value={date}
              onChange={onDateChange}
              minValue={minValue}
              maxValue={maxValue}
            />
            {showTime && (
              <CustomTimeField
                id="inline-time-input"
                label={customTimeLabel}
                value={date}
                onChange={onDateChange}
              />
            )}
          </div>
        </Popover.Dialog>
      </Popover.Content>
    </Popover>
  );
};
