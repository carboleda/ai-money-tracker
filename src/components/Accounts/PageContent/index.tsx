"use client";

import { useEffect } from "react";
import useSWR from "swr";
import { AccountsTable } from "../AccountsTable/AccountsTable";
import { Account } from "@/interfaces/account";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";
import { useAppStore } from "@/stores/useAppStore";
import { formatCurrency } from "@/config/utils";
import { useAccountStore } from "@/stores/useAccountStore";
import { TransactionTypeDecorator } from "@/components/TransactionTypeDecorator";
import { useIsMobile } from "@/hooks/useIsMobile";
import { HiScale } from "react-icons/hi";

export function PageContent() {
  const isMobile = useIsMobile();
  const { t } = useTranslation(LocaleNamespace.Accounts);
  const { setPageTitle } = useAppStore();
  const { setAccounts } = useAccountStore();

  useEffect(() => {
    setPageTitle(t("accounts"), t("subtitle"));
  }, [t, setPageTitle]);

  const { isLoading, data: response } = useSWR<{ accounts: Account[] }>(
    "/api/account"
  );

  useEffect(() => {
    if (response?.accounts && Array.isArray(response.accounts)) {
      setAccounts(response.accounts);
    }
  }, [response?.accounts, setAccounts]);

  const calculateTotalBalance = (accounts?: Account[]) => {
    if (!accounts) return 0;
    return accounts.reduce((sum, account) => sum + account.balance, 0);
  };

  const totalBalance = calculateTotalBalance(response?.accounts);

  return (
    <section className="flex flex-col items-center justify-center gap-4">
      <div className="flex flex-col w-full justify-start items-start gap-2">
        <TransactionTypeDecorator
          color="primary"
          size={isMobile ? "sm" : "md"}
          avatar={<HiScale />}
        >
          <>
            <span className="font-bold hidden md:inline">
              {t("globalBalance")}&nbsp;
            </span>
            {formatCurrency(totalBalance)}
          </>
        </TransactionTypeDecorator>
      </div>
      <AccountsTable accounts={response?.accounts} isLoading={isLoading} />
    </section>
  );
}

export default PageContent;
