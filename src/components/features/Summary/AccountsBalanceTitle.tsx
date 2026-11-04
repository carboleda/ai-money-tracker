"use client";

import React from "react";
import { HiFire } from "react-icons/hi";
import { Color, TileTable } from "@/components/features/Summary/TileTable";

import { Account } from "@/interfaces/account";
import { AccountType } from "@/app/api/domain/account/model/account.model";
import { Button, Skeleton } from "@heroui/react";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";
import { useTransactionDraftStore } from "@/stores/useTransactionDraftStore";
import { FaRegCircleCheck } from "react-icons/fa6";

export interface AccountsBalanceTitleProps {
  accountsBalance?: Account[];
  totalBalance?: number;
}

const BALANCE_ALERT_THRESHOLD = 10_000_000; // FIXME: Move to config

export const AccountsBalanceTitle: React.FC<AccountsBalanceTitleProps> = ({
  accountsBalance,
  totalBalance,
}) => {
  const { t } = useTranslation(LocaleNamespace.Summary);
  const openDraftModal = useTransactionDraftStore((s) => s.openDraftModal);

  if (!accountsBalance || !totalBalance) {
    return (
      <Skeleton className="h-60 rounded-lg w-full" />
    );
  }

  const handlePayCreditAccount = (account: Account) => {
    openDraftModal(
      t("creditPayment.prompt", {
        amount: Math.abs(account.balance),
        accountName: account.name,
      }),
      true,
    );
  };

  return (
    <TileTable
      columns={[t("account"), t("balance")]}
      data={[
        ...accountsBalance.map((account) => ({
          id: account.id,
          name: account.name,
          amount: account.balance,
          color: (account.balance > 0 ? "success" : "danger") as Color,
          action:
            account.type === AccountType.CREDIT && account.balance < 0 ? (
              <Button
                variant="ghost"
                size="sm"
                aria-label={t("creditPayment.tooltip")}
                onPress={() => handlePayCreditAccount(account)}
              >
                <FaRegCircleCheck />
                {t("creditPayment.button")}
              </Button>
            ) : undefined,
        })),
        {
          id: "balance",
          name: (
            <span className="flex gap-2 items-center font-bold">
              <span className="uppercase">{t("globalBalance")} </span>
              {totalBalance < BALANCE_ALERT_THRESHOLD && (
                <HiFire className="text-lg text-red-500" />
              )}
            </span>
          ),
          amount: totalBalance,
          color: "primary" as Color,
        },
      ]}
    />
  );
};
