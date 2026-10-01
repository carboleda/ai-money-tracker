"use client";

import React from "react";
import { Button, Dropdown, Label } from "@heroui/react";
import clsx from "clsx";
import { CHIP_BASE_CLASS, CHIP_REQUIRED_EMPTY_CLASS } from "./chipStyles";

export interface InlineSelectOption<T extends string> {
  id: T;
  label: string;
  icon?: string;
}

export interface InlineSelectChipProps<T extends string> {
  value: T;
  options: InlineSelectOption<T>[];
  onChange: (value: T) => void;
  ariaLabel: string;
  isRequired?: boolean;
  onInteraction?: () => void;
}

/**
 * Badged chip that cycles through a fixed set of options via a dropdown.
 */
export function InlineSelectChip<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
  isRequired = false,
  onInteraction = () => {},
}: Readonly<InlineSelectChipProps<T>>) {
  const selected = options.find((option) => option.id === value);

  const onOpenChange = (isOpen: boolean) => {
    if (isOpen) onInteraction();
  };

  const onSelectionChange = (keys: any) => {
    const selectedKey = [...keys.keys()][0] as T | undefined;
    if (selectedKey) onChange(selectedKey);
  };

  return (
    <Dropdown onOpenChange={onOpenChange}>
      <Button
        variant="ghost"
        className={clsx(
          CHIP_BASE_CLASS,
          isRequired && !value && CHIP_REQUIRED_EMPTY_CLASS,
        )}
      >
        {selected?.icon ? `${selected.icon} ` : ""}
        {selected?.label ?? ""} ▾
      </Button>
      <Dropdown.Popover>
        <Dropdown.Menu
          aria-label={ariaLabel}
          selectionMode="single"
          selectedKeys={value ? new Set([value]) : new Set()}
          onSelectionChange={onSelectionChange}
        >
          {options.map((option) => (
            <Dropdown.Item
              key={option.id}
              id={option.id}
              textValue={option.label}
            >
              <Label>
                {option.icon ? `${option.icon} ` : ""}
                {option.label}
              </Label>
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
