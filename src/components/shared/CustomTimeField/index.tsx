"use client";

import React from "react";
import { Label, TimeField } from "@heroui/react";
import { Time } from "@internationalized/date";
import clsx from "clsx";
import { useIsMobile } from "@/hooks/useIsMobile";

const MOBILE_INPUT_CLASS =
  "bg-field border border-field-border rounded-lg px-2 py-1 text-sm text-field-foreground";

export interface CustomTimeFieldProps {
  value: Date;
  onChange: (date: Date) => void;
  label?: string;
  "aria-label"?: string;
  isRequired?: boolean;
  isDisabled?: boolean;
  minValue?: Date;
  maxValue?: Date;
  className?: string;
  id?: string;
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
    >
      {label && <Label>{label}</Label>}
      <TimeField.Group fullWidth>
        <TimeField.InputContainer>
          <TimeField.Input>
            {(segment) => <TimeField.Segment segment={segment} />}
          </TimeField.Input>
        </TimeField.InputContainer>
      </TimeField.Group>
    </TimeField>
  );
};
