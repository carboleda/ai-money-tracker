"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";
import { ACCOUNT_TYPES, DEFAULT_ICON } from "@/interfaces/account";
import { AccountType } from "@/app/api/domain/account/model/account.model";
import {
  InlineEmojiChip,
  InlineTextChip,
  InlineSelectChip,
  InlineSelectOption,
  InlineAmountChip,
} from "@/components/shared/InlineChips";

export interface AccountChipsGroupProps {
  icon: string;
  onIconChange: (icon: string) => void;
  refValue: string;
  onRefChange: (ref: string) => void;
  isRefDisabled: boolean;
  type: AccountType;
  onTypeChange: (type: AccountType) => void;
  balance?: number;
  onBalanceChange: (balance: number) => void;
  description: string;
  onDescriptionChange: (description: string) => void;
}

export const AccountChipsGroup: React.FC<AccountChipsGroupProps> = ({
  icon,
  onIconChange,
  refValue,
  onRefChange,
  isRefDisabled,
  type,
  onTypeChange,
  balance,
  onBalanceChange,
  description,
  onDescriptionChange,
}) => {
  const { t } = useTranslation(LocaleNamespace.Accounts);

  const typeOptions: InlineSelectOption<AccountType>[] = ACCOUNT_TYPES.map(
    (accountType) => ({
      id: accountType.key,
      label: t(accountType.label),
    })
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <InlineEmojiChip
          icon={icon}
          defaultIcon={DEFAULT_ICON}
          ariaLabel={t("icon")}
          isRequired
          onIconChange={onIconChange}
        />
        <InlineTextChip
          value={refValue}
          onChange={onRefChange}
          placeholder="e.g., C1408"
          isDisabled={isRefDisabled}
          isRequired
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <InlineSelectChip
          value={type}
          options={typeOptions}
          onChange={onTypeChange}
          ariaLabel={t("type")}
          isRequired
        />
        <InlineAmountChip amount={balance} onAmountChange={onBalanceChange} />
        <InlineTextChip
          value={description}
          onChange={onDescriptionChange}
          placeholder={t("description")}
          multiline
        />
      </div>
    </div>
  );
};
