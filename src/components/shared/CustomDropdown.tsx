"use client";
import React, { useEffect, useState } from "react";
import { Select, Label, ListBox, type Key } from "@heroui/react";
import clsx from "clsx";

export interface CustomDropdownProps {
  values: { key: string; label: string }[];
  label?: string;
  value?: string;
  isRequired?: boolean;
  showLabel?: boolean;
  className?: string;
  onChange: (selectedKey: string) => void;
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({
  values,
  label = "Bank Account",
  value,
  isRequired = false,
  showLabel = false,
  className,
  onChange,
}) => {
  const [selectedKey, setSelectedKey] = useState<Key | null>(value ?? null);

  useEffect(() => {
    if (value) {
      setSelectedKey(value);
    }
  }, [value]);

  const onSelectionChange = (key: Key | null) => {
    setSelectedKey(key);
    onChange((key as string) ?? "");
  };

  return (
    <Select
      variant="secondary"
      className={className}
      placeholder={label}
      isRequired={isRequired}
      value={selectedKey}
      onChange={onSelectionChange}
    >
      <Label className={clsx({ "sr-only": !showLabel })}>{label}</Label>
      <Select.Trigger>
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover>
        <ListBox aria-label={label}>
          {values.map(({ key, label: itemLabel }) => (
            <ListBox.Item key={key} id={key} textValue={itemLabel}>
              {itemLabel}
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );
};
