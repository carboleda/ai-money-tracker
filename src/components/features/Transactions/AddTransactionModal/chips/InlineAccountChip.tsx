"use client";

import React, { useMemo } from "react";
import { Button, Dropdown, Label } from "@heroui/react";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";
import { useAccountStore } from "@/stores/useAccountStore";
import { formatCurrency } from "@/config/utils";
import { CHIP_BASE_CLASS } from "../chipStyles";

export interface InlineAccountChipProps {
  role: "source" | "destination";
  accountRef: string;
  /** Excludes matching account to prevent transferring to itself. */
  excludedAccountRef?: string;
  /**
   * Deviation from the SDD's literal prop list (§4.2 #3): `role="source"`
   * alone can't distinguish "💳 Chase ▾" (Expense/Income) from
   * "📤 From: Chase ▾" (Transfer) without knowing the active TransactionType,
   * so an optional `isTransfer` flag is added (defaults to false).
   */
  isTransfer?: boolean;
  onAccountChange: (accountRef: string) => void;
  onInteraction: () => void;
}

/**
 * Compact inline dropdown for the AI-drafted source/destination account.
 * See sdd/ai-draft-transaction-pipeline.md §2.4 (Account rows) / §4.2 (#3).
 */
export const InlineAccountChip: React.FC<InlineAccountChipProps> = ({
  role,
  accountRef,
  excludedAccountRef,
  isTransfer = false,
  onAccountChange,
  onInteraction,
}) => {
  const { t } = useTranslation(LocaleNamespace.Transactions);
  const { accounts } = useAccountStore();

  const availableAccounts = useMemo(
    () => accounts.filter((account) => account.ref !== excludedAccountRef),
    [accounts, excludedAccountRef]
  );

  const selectedAccount = accounts.find((a) => a.ref === accountRef);

  const onOpenChange = (isOpen: boolean) => {
    if (isOpen) onInteraction();
  };

  const onSelectionChange = (keys: any) => {
    const selected = [...keys.keys()][0] as string | undefined;
    if (selected) onAccountChange(selected);
  };

  const displayLabel = () => {
    if (role === "destination") {
      return selectedAccount
        ? `📥 ${t("aiDraft.account.to")}: ${selectedAccount.name}`
        : `📥 ${t("aiDraft.account.to")}: ${t("aiDraft.account.select")}`;
    }

    if (isTransfer) {
      return selectedAccount
        ? `📤 ${t("aiDraft.account.from")}: ${selectedAccount.name}`
        : `📤 ${t("aiDraft.account.from")}: ${t("aiDraft.account.select")}`;
    }

    return selectedAccount
      ? `💳 ${selectedAccount.name}`
      : `💳 ${t("aiDraft.account.select")}`;
  };

  return (
    <Dropdown onOpenChange={onOpenChange}>
      <Button variant="ghost" className={CHIP_BASE_CLASS}>
        {displayLabel()} ▾
      </Button>
      <Dropdown.Popover>
        <Dropdown.Menu
          aria-label={
            role === "source"
              ? t("sourceAccount")
              : t("destinationAccount")
          }
          selectionMode="single"
          selectedKeys={accountRef ? new Set([accountRef]) : new Set()}
          onSelectionChange={onSelectionChange}
        >
          {availableAccounts.map((account) => (
            <Dropdown.Item
              key={account.ref}
              id={account.ref}
              textValue={account.name}
            >
              <Label>
                {account.icon} {account.name} —{" "}
                {formatCurrency(account.balance)}
              </Label>
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
};
