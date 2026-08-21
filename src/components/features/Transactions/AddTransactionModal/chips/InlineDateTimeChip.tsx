"use client";

import React, { useMemo, useState } from "react";
import { Button, Popover } from "@heroui/react";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";
import { CustomDateField } from "@/components/shared/CustomDateField";
import { CustomTimeField } from "@/components/shared/CustomTimeField";
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

/**
 * Popover-based date & time chip implementing the spec's affordance —
 * "Quick date pills (Today / Yesterday / Custom Date Input) + Time input".
 * Date/time inputs delegate to `CustomDateField`/`CustomTimeField`, which
 * pick HeroUI's compound `DatePicker`/`TimeField` on desktop and native
 * `<input>` elements on mobile.
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
      year: "numeric",
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
            <CustomDateField
              id="draft-date-input"
              label={t("aiDraft.dateTime.customDate")}
              value={date}
              onChange={onDateChange}
            />
            <CustomTimeField
              id="draft-time-input"
              label={t("aiDraft.dateTime.time")}
              value={date}
              onChange={onDateChange}
            />
          </div>
        </Popover.Dialog>
      </Popover.Content>
    </Popover>
  );
};
