"use client";

import React from "react";
import { Button, Dropdown, Label } from "@heroui/react";
import { TransactionType } from "@/app/api/domain/transaction/model/transaction.model";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";
import { CHIP_BASE_CLASS } from "../chipStyles";

export interface InlineTypeChipProps {
  type: TransactionType;
  onTypeChange: (type: TransactionType) => void;
  onInteraction: () => void;
}

const TYPE_ICON: Record<TransactionType, string> = {
  [TransactionType.EXPENSE]: "🏷️",
  [TransactionType.INCOME]: "🏷️",
  [TransactionType.TRANSFER]: "🏷️",
};

/**
 * Badged chip that toggles between Expense / Income / Transfer.
 * See sdd/ai-draft-transaction-pipeline.md §2.4 (Type row) / §4.2 (#5).
 */
export const InlineTypeChip: React.FC<InlineTypeChipProps> = ({
  type,
  onTypeChange,
  onInteraction,
}) => {
  const { t } = useTranslation(LocaleNamespace.Transactions);

  const typeLabel = (value: TransactionType) =>
    ({
      [TransactionType.EXPENSE]: t("aiDraft.type.expense"),
      [TransactionType.INCOME]: t("aiDraft.type.income"),
      [TransactionType.TRANSFER]: t("aiDraft.type.transfer"),
    }[value]);

  const onOpenChange = (isOpen: boolean) => {
    if (isOpen) onInteraction();
  };

  const onSelectionChange = (keys: any) => {
    const selected = [...keys.keys()][0] as TransactionType | undefined;
    if (selected) onTypeChange(selected);
  };

  return (
    <Dropdown onOpenChange={onOpenChange}>
      <Button variant="ghost" className={CHIP_BASE_CLASS}>
        {TYPE_ICON[type]} {typeLabel(type)} ▾
      </Button>
      <Dropdown.Popover>
        <Dropdown.Menu
          aria-label={t("aiDraft.type.label")}
          selectionMode="single"
          selectedKeys={new Set([type])}
          onSelectionChange={onSelectionChange}
        >
          <Dropdown.Item id={TransactionType.EXPENSE} textValue="Expense">
            <Label>{typeLabel(TransactionType.EXPENSE)}</Label>
          </Dropdown.Item>
          <Dropdown.Item id={TransactionType.INCOME} textValue="Income">
            <Label>{typeLabel(TransactionType.INCOME)}</Label>
          </Dropdown.Item>
          <Dropdown.Item id={TransactionType.TRANSFER} textValue="Transfer">
            <Label>{typeLabel(TransactionType.TRANSFER)}</Label>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
};
