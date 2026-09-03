"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { fetchJson } from "@/config/request";
import { ZolventFilter } from "@/components/shared/ZolventFilter/ZolventFilter";

const KEY = "/api/account";

export function PageContent() {
  const isMobile = useIsMobile();
  const { t } = useTranslation(LocaleNamespace.Accounts);
  const { setPageTitle } = useAppStore();
  const { setAccounts } = useAccountStore();

  useEffect(() => {
    setPageTitle(t("accounts"), t("subtitle"));
  }, [t, setPageTitle]);

  const { isLoading, data: response } = useQuery<{ accounts: Account[] }>({
    queryKey: [KEY],
    queryFn: () => fetchJson<{ accounts: Account[] }>(KEY),
  });

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
    <ZolventFilter t={t} storageKey="accounts-filters" onFilter={() => {}}>
      <section className="flex flex-col items-center justify-center gap-2">
        <div className="flex flex-col w-full justify-start items-start gap-2 mb-2">
          <TransactionTypeDecorator
            color="accent"
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
    </ZolventFilter>
  );
}

export default PageContent;
