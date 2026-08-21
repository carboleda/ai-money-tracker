"use client";

import React, { useMemo, useState } from "react";
import { Button, Popover } from "@heroui/react";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";
import { CHIP_BASE_CLASS } from "../chipStyles";

export interface InlineDateTimeChipProps {
  date: Date;
  onDateChange: (date: Date) => void;
  onInteraction: () => void;
}

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const toTimeInputValue = (date: Date) =>
  `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")}`;

const toDateInputValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Popover-based date & time chip. Deviation from the SDD's full `<Calendar>`
 * grid convention (§4.2 #6): implements the spec's own described affordance
 * — "Quick date pills (Today / Yesterday / Custom Date Input) + Time input" —
 * using a plain `<input type="date">`/`<input type="time">` pair instead of
 * the heavier `@internationalized/date` Calendar compound, since the spec
 * only calls for a lightweight custom date input, not a full month grid.
 * See sdd/ai-draft-transaction-pipeline.md §2.4 (Date & Time row) / §4.2 (#6).
 */
export const InlineDateTimeChip: React.FC<InlineDateTimeChipProps> = ({
  date,
  onDateChange,
  onInteraction,
}) => {
  const { t } = useTranslation(LocaleNamespace.Transactions);
  const [isOpen, setIsOpen] = useState(false);

  const label = useMemo(() => {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    const time = date.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });

    if (isSameDay(date, now)) {
      return `📅 ${t("aiDraft.dateTime.today")}, ${time}`;
    }

    if (isSameDay(date, yesterday)) {
      return `📅 ${t("aiDraft.dateTime.yesterday")}, ${time}`;
    }

    const dateLabel = date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });

    return `📅 ${dateLabel}, ${time}`;
  }, [date, t]);

  const onOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) onInteraction();
  };

  const setQuickDay = (offsetDays: number) => {
    const next = new Date();
    next.setDate(next.getDate() + offsetDays);
    next.setHours(date.getHours(), date.getMinutes(), 0, 0);
    onDateChange(next);
  };

  const onDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) return;
    const [year, month, day] = e.target.value.split("-").map(Number);
    const next = new Date(date);
    next.setFullYear(year, month - 1, day);
    onDateChange(next);
  };

  const onTimeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) return;
    const [hours, minutes] = e.target.value.split(":").map(Number);
    const next = new Date(date);
    next.setHours(hours, minutes, 0, 0);
    onDateChange(next);
  };

  return (
    <Popover isOpen={isOpen} onOpenChange={onOpenChange}>
      <Button variant="ghost" className={CHIP_BASE_CLASS}>
        {label} ▾
      </Button>
      <Popover.Content placement="bottom">
        <Popover.Dialog>
          <Popover.Arrow />
          <div className="flex flex-col gap-3 p-1 min-w-56">
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onPress={() => setQuickDay(0)}>
                {t("aiDraft.dateTime.today")}
              </Button>
              <Button size="sm" variant="secondary" onPress={() => setQuickDay(-1)}>
                {t("aiDraft.dateTime.yesterday")}
              </Button>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs text-muted" htmlFor="draft-date-input">
                {t("aiDraft.dateTime.customDate")}
              </label>
              <input
                id="draft-date-input"
                type="date"
                value={toDateInputValue(date)}
                onChange={onDateInputChange}
                className="bg-field-background border border-field-border rounded-lg px-2 py-1 text-sm text-field-foreground"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs text-muted" htmlFor="draft-time-input">
                {t("aiDraft.dateTime.time")}
              </label>
              <input
                id="draft-time-input"
                type="time"
                value={toTimeInputValue(date)}
                onChange={onTimeInputChange}
                className="bg-field-background border border-field-border rounded-lg px-2 py-1 text-sm text-field-foreground"
              />
            </div>
          </div>
        </Popover.Dialog>
      </Popover.Content>
    </Popover>
  );
};
