"use client";

import React from "react";
import { Calendar, DateField, DatePicker, DatePickerProps, Label } from "@heroui/react";
import { CalendarDate } from "@internationalized/date";
import clsx from "clsx";
import { useIsMobile } from "@/hooks/useIsMobile";

const MOBILE_INPUT_CLASS =
  "bg-field border border-field-border rounded-lg px-2 py-1 text-sm text-field-foreground";

export interface CustomDateFieldProps
  extends Omit<
    DatePickerProps<CalendarDate>,
    "value" | "onChange" | "minValue" | "maxValue" | "children"
  > {
  value: Date;
  onChange: (date: Date) => void;
  label?: string;
  minValue?: Date;
  maxValue?: Date;
}

const toCalendarDate = (date: Date): CalendarDate =>
  new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate());

const mergeCalendarDate = (base: Date, calendarDate: CalendarDate): Date => {
  const next = new Date(base);
  next.setFullYear(calendarDate.year, calendarDate.month - 1, calendarDate.day);
  return next;
};

const toDateInputValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Responsive date field: HeroUI's segmented `DatePicker` + `Calendar` on
 * desktop, a native `<input type="date">` on mobile — the OS picker beats
 * the segmented input on touch devices, while the HeroUI compound is the
 * better desktop UX. Device choice follows `useIsMobile()`.
 */
export const CustomDateField: React.FC<CustomDateFieldProps> = ({
  value,
  onChange,
  label,
  "aria-label": ariaLabel,
  isRequired,
  isDisabled,
  minValue,
  maxValue,
  className,
  id,
  ...rest
}) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label className="text-xs text-muted" htmlFor={id}>
            {label}
          </label>
        )}
        <input
          id={id}
          type="date"
          aria-label={ariaLabel}
          required={isRequired}
          disabled={isDisabled}
          min={minValue ? toDateInputValue(minValue) : undefined}
          max={maxValue ? toDateInputValue(maxValue) : undefined}
          value={toDateInputValue(value)}
          onChange={(e) => {
            if (!e.target.value) return;
            const [year, month, day] = e.target.value.split("-").map(Number);
            const next = new Date(value);
            next.setFullYear(year, month - 1, day);
            onChange(next);
          }}
          className={clsx(MOBILE_INPUT_CLASS, className)}
        />
      </div>
    );
  }

  return (
    <DatePicker
      id={id}
      granularity="day"
      shouldForceLeadingZeros
      value={toCalendarDate(value)}
      onChange={(calendarDate) => {
        if (!calendarDate) return;
        onChange(mergeCalendarDate(value, calendarDate));
      }}
      minValue={minValue ? toCalendarDate(minValue) : undefined}
      maxValue={maxValue ? toCalendarDate(maxValue) : undefined}
      isRequired={isRequired}
      isDisabled={isDisabled}
      aria-label={ariaLabel}
      className={className}
      {...rest}
    >
      {label && <Label>{label}</Label>}
      <DateField.Group variant="secondary" fullWidth>
        <DateField.Input>
          {(segment) => <DateField.Segment segment={segment} />}
        </DateField.Input>
        <DateField.Suffix>
          <DatePicker.Trigger>
            <DatePicker.TriggerIndicator />
          </DatePicker.Trigger>
        </DateField.Suffix>
      </DateField.Group>
      <DatePicker.Popover>
        <Calendar aria-label={ariaLabel ?? label}>
          <Calendar.Header>
            <Calendar.YearPickerTrigger>
              <Calendar.YearPickerTriggerHeading />
              <Calendar.YearPickerTriggerIndicator />
            </Calendar.YearPickerTrigger>
            <Calendar.NavButton slot="previous" />
            <Calendar.NavButton slot="next" />
          </Calendar.Header>
          <Calendar.Grid>
            <Calendar.GridHeader>
              {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
            </Calendar.GridHeader>
            <Calendar.GridBody>
              {(date) => <Calendar.Cell date={date} />}
            </Calendar.GridBody>
          </Calendar.Grid>
          <Calendar.YearPickerGrid>
            <Calendar.YearPickerGridBody>
              {({ year }) => <Calendar.YearPickerCell year={year} />}
            </Calendar.YearPickerGridBody>
          </Calendar.YearPickerGrid>
        </Calendar>
      </DatePicker.Popover>
    </DatePicker>
  );
};
