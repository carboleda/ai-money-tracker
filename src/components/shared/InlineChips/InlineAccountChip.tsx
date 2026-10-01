"use client";

import React, { useMemo } from "react";
import { Button, Dropdown, Label } from "@heroui/react";
import clsx from "clsx";
import { CHIP_BASE_CLASS, CHIP_REQUIRED_EMPTY_CLASS } from "./chipStyles";

export interface InlineAccountOption {
  ref: string;
  name: string;
  icon: string;
}

export interface InlineAccountChipProps<
  T extends InlineAccountOption = InlineAccountOption,
> {
  accountRef: string;
  accounts: T[];
  filterFn?: (account: T) => boolean;
  icon: string;
  labelPrefix?: string;
  placeholder: string;
  ariaLabel: string;
  isRequired?: boolean;
  onAccountChange: (accountRef: string) => void;
  onInteraction?: () => void;
}

/**
 * Compact inline dropdown for selecting an account. `icon` is the
 * placeholder/role icon shown while nothing is selected; once an account is
 * selected, its own icon is shown instead.
 */
export function InlineAccountChip<T extends InlineAccountOption>({
  accountRef,
  accounts,
  filterFn = () => true,
  icon,
  labelPrefix = "",
  placeholder,
  ariaLabel,
  isRequired = false,
  onAccountChange,
  onInteraction = () => {},
}: Readonly<InlineAccountChipProps<T>>) {
  const options = useMemo(
    () => accounts.filter(filterFn),
    [accounts, filterFn],
  );
  const selected = options.find((option) => option.ref === accountRef);

  const onOpenChange = (isOpen: boolean) => {
    if (isOpen) onInteraction();
  };

  const onSelectionChange = (keys: any) => {
    const selected = [...keys.keys()][0] as string | undefined;
    if (selected) onAccountChange(selected);
  };

  return (
    <Dropdown onOpenChange={onOpenChange}>
      <Button
        variant="ghost"
        className={clsx(
          CHIP_BASE_CLASS,
          isRequired && !accountRef && CHIP_REQUIRED_EMPTY_CLASS,
        )}
      >
        {selected?.icon ?? icon} {labelPrefix}
        {selected?.name ?? placeholder} ▾
      </Button>
      <Dropdown.Popover>
        <Dropdown.Menu
          aria-label={ariaLabel}
          selectionMode="single"
          selectedKeys={accountRef ? new Set([accountRef]) : new Set()}
          onSelectionChange={onSelectionChange}
        >
          {options.map((option) => (
            <Dropdown.Item
              key={option.ref}
              id={option.ref}
              textValue={option.name}
            >
              <Label>
                {option.icon} {option.name}
              </Label>
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
