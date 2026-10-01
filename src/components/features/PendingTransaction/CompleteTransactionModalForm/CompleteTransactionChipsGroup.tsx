"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";
import { TransactionType } from "@/app/api/domain/transaction/model/transaction.model";
import { useAccountStore } from "@/stores/useAccountStore";
import {
  InlineAmountChip,
  InlineAccountChip,
  InlineDateTimeChip,
} from "@/components/shared/InlineChips";
import {
  getAmountColorClass,
  getAmountSign,
} from "@/components/features/Transactions/AddTransactionModal/transactionChipColors";

export interface CompleteTransactionChipsGroupProps {
  type?: TransactionType;
  amount?: number;
  onAmountChange: (amount: number) => void;
  sourceAccountRef: string;
  onSourceAccountChange: (accountRef: string) => void;
  createdAt?: Date;
  onCreatedAtChange: (date: Date) => void;
}

export const CompleteTransactionChipsGroup: React.FC<
  CompleteTransactionChipsGroupProps
> = ({
  type,
  amount,
  onAmountChange,
  sourceAccountRef,
  onSourceAccountChange,
  createdAt,
  onCreatedAtChange,
}) => {
  const { t } = useTranslation(LocaleNamespace.RecurringExpenses);
  const { t: tTransactions } = useTranslation(LocaleNamespace.Transactions);
  const { accounts } = useAccountStore();

  return (
    <div className="flex flex-wrap gap-2">
      <InlineAccountChip
        accountRef={sourceAccountRef}
        accounts={accounts}
        icon="💳"
        placeholder={tTransactions("aiDraft.account.select")}
        ariaLabel={t("bankAccount")}
        isRequired
        onAccountChange={onSourceAccountChange}
      />
      <InlineAmountChip
        amount={amount}
        colorClassName={type ? getAmountColorClass(type) : ""}
        sign={type ? getAmountSign(type) : ""}
        isRequired
        onAmountChange={onAmountChange}
      />
      <InlineDateTimeChip
        date={createdAt ?? new Date()}
        onDateChange={onCreatedAtChange}
        isRequired
        todayLabel={tTransactions("aiDraft.dateTime.today")}
        yesterdayLabel={tTransactions("aiDraft.dateTime.yesterday")}
        customDateLabel={tTransactions("aiDraft.dateTime.customDate")}
        customTimeLabel={tTransactions("aiDraft.dateTime.time")}
      />
    </div>
  );
};
