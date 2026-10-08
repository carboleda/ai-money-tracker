"use client";

import { Label, ListBox, Select } from "@heroui/react";
import clsx from "clsx";
import { CHIP_BASE_CLASS } from "./chipStyles";
import type { InlineSelectOption } from "./InlineSelectChip";

export interface InlineMultiSelectChipProps<T extends string> {
  values: T[];
  options: InlineSelectOption<T>[];
  onChange: (values: T[]) => void;
  ariaLabel: string;
  placeholder?: string;
  onInteraction?: () => void;
}

/**
 * Badged chip for a multi-select, built on HeroUI's Select+ListBox
 * (selectionMode="multiple") since Dropdown only supports single-select.
 */
export function InlineMultiSelectChip<T extends string>({
  values,
  options,
  onChange,
  ariaLabel,
  placeholder = "",
  onInteraction = () => {},
}: Readonly<InlineMultiSelectChipProps<T>>) {
  const selectedLabels = options
    .filter((option) => values.includes(option.id))
    .map((option) =>
      option.icon ? `${option.icon} ${option.label}` : option.label,
    );

  const onOpenChange = (isOpen: boolean) => {
    if (isOpen) onInteraction();
  };

  return (
    <Select
      aria-label={ariaLabel}
      className="min-w-40"
      selectionMode="multiple"
      value={values}
      onChange={(next) => onChange(next as T[])}
      onOpenChange={onOpenChange}
    >
      <Select.Trigger className={clsx(CHIP_BASE_CLASS)}>
        {selectedLabels.length ? selectedLabels.join(", ") : placeholder}
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover>
        <ListBox aria-label={ariaLabel}>
          {options.map((option) => (
            <ListBox.Item
              key={option.id}
              id={option.id}
              textValue={option.label}
            >
              <Label>
                {option.icon ? `${option.icon} ` : ""}
                {option.label}
              </Label>
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );
}
