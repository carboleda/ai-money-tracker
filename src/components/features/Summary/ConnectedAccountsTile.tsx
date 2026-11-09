"use client";

import React from "react";
import { Button, Skeleton, Surface } from "@heroui/react";
import clsx from "clsx";
import { FaRegCircleCheck } from "react-icons/fa6";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";
import { Account } from "@/interfaces/account";
import { AccountType } from "@/app/api/domain/account/model/account.model";
import { formatCurrency } from "@/config/utils";
import { CustomIcon } from "@/components/shared/CustomIcon";
import { useTransactionDraftStore } from "@/stores/useTransactionDraftStore";
import { useIsMobile } from "@/hooks/useIsMobile";

export interface ConnectedAccountsTileProps {
  accountsBalance?: Account[];
  totalBalance?: number;
}

const ACCOUNT_TYPE_BADGE_CLASS: Record<AccountType, string> = {
  [AccountType.SAVING]: "bg-success/15 text-success",
  [AccountType.CREDIT]: "bg-danger/15 text-danger",
  [AccountType.INVESTMENT]: "bg-accent/15 text-accent",
};

export const ConnectedAccountsTile: React.FC<ConnectedAccountsTileProps> = ({
  accountsBalance,
  totalBalance,
}) => {
  const { t } = useTranslation(LocaleNamespace.Summary);
  const isMobile = useIsMobile();
  const openDraftModal = useTransactionDraftStore((s) => s.openDraftModal);

  if (!accountsBalance || totalBalance === undefined) {
    return <Skeleton className="h-full min-h-80 w-full rounded-2xl" />;
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

  const renderAccountList = () => {
    if (accountsBalance.length === 0) {
      return <p className="text-sm text-muted">{t("accounts.noAccounts")}</p>;
    }

    if (isMobile) {
      return (
        <MobileAccountsList
          accountsBalance={accountsBalance}
          onPayCreditAccount={handlePayCreditAccount}
        />
      );
    } else {
      return (
        <DesktopAccountsList
          accountsBalance={accountsBalance}
          onPayCreditAccount={handlePayCreditAccount}
        />
      );
    }
  };

  return (
    <Surface
      variant="default"
      className="flex h-full flex-col rounded-2xl border border-border p-5"
    >
      <h3 className="mb-3 text-sm font-bold">{t("accounts.title")}</h3>

      {renderAccountList()}

      <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
        <span className="text-[11px] font-semibold uppercase text-muted">
          {t("accounts.totalLiquidity")}
        </span>
        <span className="text-base font-bold">
          {formatCurrency(totalBalance)}
        </span>
      </div>
    </Surface>
  );
};

interface AccountsListProps {
  accountsBalance: Account[];
  onPayCreditAccount: (account: Account) => void;
}

const MobileAccountsList: React.FC<AccountsListProps> = ({
  accountsBalance,
  onPayCreditAccount,
}) => {
  const { t } = useTranslation(LocaleNamespace.Summary);
  const { t: tAccounts } = useTranslation(LocaleNamespace.Accounts);

  return (
    <ul className="flex flex-row gap-3 overflow-x-auto pb-1 snap-x">
      {accountsBalance.map((account) => (
        <li
          key={account.id}
          className="flex min-w-[150px] shrink-0 flex-col gap-3 rounded-2xl border border-border bg-surface-secondary p-3 snap-start"
        >
          <div className="flex items-center justify-between gap-2">
            <span
              className={clsx(
                "flex size-9 shrink-0 items-center justify-center rounded-xl text-lg",
                ACCOUNT_TYPE_BADGE_CLASS[account.type],
              )}
            >
              {account.icon}
            </span>
            <span className="shrink-0 rounded-full bg-default px-2 py-0.5 text-[11px] font-medium text-default-foreground">
              {tAccounts(account.type)}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="truncate text-sm font-medium">{account.name}</span>
            <span
              className={clsx(
                "text-lg font-bold",
                account.balance < 0 && "text-danger",
              )}
            >
              {formatCurrency(account.balance)}
            </span>
          </div>
          {account.type === AccountType.CREDIT && account.balance < 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              aria-label={t("creditPayment.tooltip")}
              onPress={() => onPayCreditAccount(account)}
            >
              <FaRegCircleCheck />
              {t("creditPayment.button")}
            </Button>
          )}
        </li>
      ))}
    </ul>
  );
};

const DesktopAccountsList: React.FC<AccountsListProps> = ({
  accountsBalance,
  onPayCreditAccount,
}) => {
  const { t } = useTranslation(LocaleNamespace.Summary);
  const { t: tAccounts } = useTranslation(LocaleNamespace.Accounts);

  return (
    <ul className="flex flex-col gap-2">
      {accountsBalance.map((account) => (
        <li
          key={account.id}
          className="flex items-center gap-2 rounded-xl border border-border p-2"
        >
          <CustomIcon icon={account.icon} size="sm" />
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-medium">{account.name}</span>
            <span className="text-[11px] text-muted">
              {tAccounts(account.type)}
            </span>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span
              className={clsx(
                "text-sm font-semibold",
                account.balance >= 0 ? "text-success" : "text-danger",
              )}
            >
              {formatCurrency(account.balance)}
            </span>
            {account.type === AccountType.CREDIT && account.balance < 0 && (
              <Button
                variant="ghost"
                size="sm"
                aria-label={t("creditPayment.tooltip")}
                onPress={() => onPayCreditAccount(account)}
              >
                <FaRegCircleCheck />
                {t("creditPayment.button")}
              </Button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
};
