"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Dropdown, Button, Label } from "@heroui/react";
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
  const [selectedKeys, setSelectedKeys] = useState(new Set<string>([]));

  const selectedValue = useMemo(
    () =>
      Array.from(selectedKeys)
        .map((key) => values.find((v) => v.key === key)?.label ?? "")
        .join(", "),
    [selectedKeys, values]
  );

  useEffect(() => {
    if (value) {
      setSelectedKeys(new Set([value]));
    }
  }, [value]);

  const onSelectionChange = (keys: any) => {
    setSelectedKeys(keys);
    onChange([...keys.keys()][0] || "");
  };

  return (
    <Dropdown>
      <Button
        variant="secondary"
        className={clsx("justify-start px-3 rounded-xl", className, {
          "py-6": showLabel,
        })}
      >
        <div className="text-start mh-5">
          {showLabel ? (
            <>
              <label className="text-xs text-default-600">
                {label} {isRequired && <span className="text-red-600">*</span>}
              </label>
              <div className="text-default-600">{selectedValue}</div>
            </>
          ) : (
            <div>{selectedValue || label}</div>
          )}
        </div>
      </Button>
      <Dropdown.Popover>
        <Dropdown.Menu
          aria-label={label}
          selectionMode="single"
          selectedKeys={selectedKeys}
          onSelectionChange={onSelectionChange}
        >
          {values.map(({ key, label }) => (
            <Dropdown.Item key={key} id={key} textValue={label}>
              <Label>{label}</Label>
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
};
