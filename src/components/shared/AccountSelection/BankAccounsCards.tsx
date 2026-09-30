"use client";

import React from "react";
import clsx from "clsx";
import { CustomDropdownProps } from "../CustomDropdown";
import { useAccountStore } from "@/stores/useAccountStore";
import { Label, Tag, TagGroup } from "@heroui/react";

interface BankAccounsCardsProps extends Omit<CustomDropdownProps, "values"> {}

const CARD_COLORS = [
  "bg-emerald-600 text-white",
  "bg-rose-600 text-white",
  "bg-blue-600 text-white",
  "bg-amber-600 text-white",
  "bg-violet-600 text-white",
  "bg-cyan-600 text-white",
];

export const BankAccounsCards: React.FC<BankAccounsCardsProps> = ({
  label = "Bank Account",
  value,
  isRequired = false,
  allowEmptySelection = true,
  showLabel = false,
  className,
  onChange,
}) => {
  const { accounts } = useAccountStore();

  const onSelectionChange = (keys: "all" | Set<React.Key>) => {
    const selectedKey =
      keys === "all" ? undefined : ([...keys][0] as string | undefined);
    onChange(selectedKey);
  };

  return (
    <div className={clsx("flex flex-col gap-2 w-full", className)}>
      <Label className={clsx({ "sr-only": !showLabel })}>{label}</Label>
      <TagGroup
        selectionMode="single"
        disallowEmptySelection={!allowEmptySelection}
        selectedKeys={value ? new Set([value]) : new Set()}
        onSelectionChange={onSelectionChange}
        aria-required={isRequired || undefined}
      >
        <TagGroup.List className="flex flex-nowrap items-stretch gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
          {accounts.map((account, index) => (
            <Tag
              key={account.ref}
              id={account.ref}
              textValue={account.name}
              className={({ isSelected }) =>
                clsx(
                  "flex! flex-col! w-24! max-w-24! shrink-0 min-w-0 justify-between gap-0.5 h-11 overflow-hidden rounded-2xl p-1.5 border-2 cursor-pointer transition-all",
                  CARD_COLORS[index % CARD_COLORS.length],
                  isSelected
                    ? "border-muted"
                    : "border-transparent opacity-70 hover:opacity-100",
                )
              }
            >
              <span className="block w-full min-w-0 text-[11px] font-semibold truncate">
                {account.icon} {account.name}
              </span>
              <span className="block w-full min-w-0 text-[9px] opacity-80 truncate">
                {account.ref}
              </span>
            </Tag>
          ))}
        </TagGroup.List>
      </TagGroup>
    </div>
  );
};
