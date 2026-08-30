"use client";

import React from "react";
import { Label, TimeField, TimeFieldProps } from "@heroui/react";
import { Time } from "@internationalized/date";
import clsx from "clsx";
import { useIsMobile } from "@/hooks/useIsMobile";

const MOBILE_INPUT_CLASS = clsx(
  "flex w-full bg-default rounded-field border-0 px-3 py-2 text-base text-field-foreground sm:text-sm",
  "outline-none",
  "focus:ring-2 focus:ring-focus focus:ring-offset-0 focus:outline-none",
  "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
  "[&::-webkit-calendar-picker-indicator]:hidden"
);

export interface CustomTimeFieldProps
  extends Omit<
    TimeFieldProps<Time>,
    "value" | "onChange" | "minValue" | "maxValue" | "children"
  > {
  value: Date;
  onChange: (date: Date) => void;
  label?: string;
  minValue?: Date;
  maxValue?: Date;
}

const toTime = (date: Date): Time => new Time(date.getHours(), date.getMinutes());

const mergeTime = (base: Date, time: Time): Date => {
  const next = new Date(base);
  next.setHours(time.hour, time.minute, 0, 0);
  return next;
};

const toTimeInputValue = (date: Date) =>
  `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")}`;

/**
 * Responsive time field: HeroUI's segmented `TimeField` on desktop, a
 * native `<input type="time">` on mobile. Device choice follows
 * `useIsMobile()` — see `CustomDateField` for the date-only counterpart.
 */
export const CustomTimeField: React.FC<CustomTimeFieldProps> = ({
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
      <div className="flex w-full flex-col gap-1" data-required={isRequired || undefined}>
        {label && <Label htmlFor={id}>{label}</Label>}
        <input
          id={id}
          type="time"
          aria-label={ariaLabel}
          required={isRequired}
          disabled={isDisabled}
          min={minValue ? toTimeInputValue(minValue) : undefined}
          max={maxValue ? toTimeInputValue(maxValue) : undefined}
          value={toTimeInputValue(value)}
          onChange={(e) => {
            if (!e.target.value) return;
            const [hours, minutes] = e.target.value.split(":").map(Number);
            const next = new Date(value);
            next.setHours(hours, minutes, 0, 0);
            onChange(next);
          }}
          className={clsx(MOBILE_INPUT_CLASS, className)}
        />
      </div>
    );
  }

  return (
    <TimeField
      id={id}
      shouldForceLeadingZeros
      value={toTime(value)}
      onChange={(time) => {
        if (!time) return;
        onChange(mergeTime(value, time));
      }}
      minValue={minValue ? toTime(minValue) : undefined}
      maxValue={maxValue ? toTime(maxValue) : undefined}
      isRequired={isRequired}
      isDisabled={isDisabled}
      aria-label={ariaLabel}
      className={className}
      {...rest}
    >
      {label && <Label>{label}</Label>}
      <TimeField.Group variant="secondary" fullWidth>
        <TimeField.InputContainer>
          <TimeField.Input>
            {(segment) => <TimeField.Segment segment={segment} />}
          </TimeField.Input>
        </TimeField.InputContainer>
      </TimeField.Group>
    </TimeField>
  );
};
