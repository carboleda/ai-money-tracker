"use client";

import React, { useCallback, useEffect, useState } from "react";
import { ComboBox, Input, ListBox } from "@heroui/react";
import clsx from "clsx";
import { CHIP_BASE_CLASS, CHIP_REQUIRED_EMPTY_CLASS } from "./chipStyles";
import type { InlineSelectOption } from "./InlineSelectChip";

export interface InlineComboBoxChipProps<T extends string> {
  value: T;
  options: InlineSelectOption<T>[];
  onChange: (value: T) => void;
  ariaLabel: string;
  isRequired?: boolean;
  onInteraction?: () => void;
  /** Formats a custom (non-preset) value for display, e.g. `(v) => `${v}%``. Defaults to the raw value. */
  formatCustomValue?: (value: T) => string;
  /** Rejects keystrokes that would make the typed custom value invalid, e.g. `(text) => /^\d*$/.test(text)`. Defaults to allowing anything. */
  isValidCustomInput?: (text: string) => boolean;
}

function findOption<T extends string>(
  options: InlineSelectOption<T>[],
  value: T,
) {
  return options.find((option) => option.id === value);
}

/**
 * Chip-styled combobox: pick a preset option or type a custom value.
 */
export function InlineComboBoxChip<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
  isRequired = false,
  onInteraction = () => {},
  formatCustomValue = (v) => v,
  isValidCustomInput = () => true,
}: Readonly<InlineComboBoxChipProps<T>>) {
  const labelFor = useCallback(
    (v: T) => findOption(options, v)?.label ?? formatCustomValue(v),
    [options, formatCustomValue],
  );
  const [inputValue, setInputValue] = useState(() => labelFor(value));
  const [selectedKey, setSelectedKey] = useState<T | null>(
    () => findOption(options, value)?.id ?? null,
  );

  useEffect(() => {
    setInputValue(labelFor(value));
    setSelectedKey(findOption(options, value)?.id ?? null);
  }, [value, options, labelFor]);

  const onOpenChange = (isOpen: boolean) => {
    if (isOpen) onInteraction();
  };

  const onSelectionChange = (key: React.Key | null) => {
    if (key == null) return;
    const nextValue = key as T;
    setSelectedKey(nextValue);
    setInputValue(labelFor(nextValue));
    onChange(nextValue);
  };

  // Typing diverges the input from the previously selected option, so the
  // stale selectedKey must be cleared or commitCustomValue would mistake the
  // typed text for an unchanged selection and revert it instead of committing.
  const handleInputChange = (text: string) => {
    const previousLabel = selectedKey
      ? findOption(options, selectedKey)?.label
      : undefined;
    const staysSelected = selectedKey !== null && text === previousLabel;
    if (!staysSelected && !isValidCustomInput(text)) return;
    setInputValue(text);
    setSelectedKey(staysSelected ? selectedKey : null);
  };

  // While editing, show the raw value instead of its formatted label so
  // re-committing it unchanged doesn't feed an already-formatted string
  // back through formatCustomValue (e.g. "63%" -> "63%%").
  const onFocus = () => {
    if (!selectedKey) setInputValue(value);
  };

  const commitCustomValue = () => {
    if (selectedKey) return;
    const trimmed = inputValue.trim();
    if (!trimmed) {
      setInputValue(labelFor(value));
      return;
    }
    const nextValue = trimmed as T;
    if (nextValue !== value) onChange(nextValue);
    setInputValue(labelFor(nextValue));
  };

  return (
    <ComboBox
      allowsCustomValue
      aria-label={ariaLabel}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      value={selectedKey}
      onChange={onSelectionChange}
      onOpenChange={onOpenChange}
    >
      <ComboBox.InputGroup
        className={clsx(
          CHIP_BASE_CLASS,
          "p-0!",
          isRequired && !value && CHIP_REQUIRED_EMPTY_CLASS,
        )}
      >
        <Input
          className="w-auto bg-transparent border-0 outline-none text-foreground"
          onFocus={onFocus}
          onBlur={commitCustomValue}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commitCustomValue();
            }
            if (e.key === "Escape") {
              e.preventDefault();
              setInputValue(labelFor(value));
            }
          }}
        />
        <ComboBox.Trigger />
      </ComboBox.InputGroup>
      <ComboBox.Popover>
        <ListBox>
          {options.map((option) => (
            <ListBox.Item
              key={option.id}
              id={option.id}
              textValue={option.label}
            >
              {option.icon ? `${option.icon} ` : ""}
              {option.label}
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </ComboBox.Popover>
    </ComboBox>
  );
}
