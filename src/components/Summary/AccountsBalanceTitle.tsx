"use client";

import React from "react";
import { HiFire } from "react-icons/hi";
import { Color, TileTable } from "@/components/Summary/TileTable";

import { Account } from "@/interfaces/account";
import { Skeleton } from "@nextui-org/skeleton";

export interface AccountsBalanceTitleProps {
  accountsBalance?: Account[];
  totalBalance?: number;
}

const BALANCE_ALERT_THRESHOLD = 10_000_000; // FIXME: Move to config

export const AccountsBalanceTitle: React.FC<AccountsBalanceTitleProps> = ({
  accountsBalance,
  totalBalance,
}) => {
  if (!accountsBalance || !totalBalance) {
    return (
      <Skeleton className="rounded-lg w-full">
        <div className="h-60 rounded-lg bg-default-200"></div>
      </Skeleton>
    );
  }

  return (
    <TileTable
      columns={["ACCOUNT", "BANLANCE"]}
      data={[
        ...accountsBalance.map((account) => ({
          id: account.id,
          name: account.account,
          amount: account.balance,
          color: (account.balance > 0 ? "success" : "danger") as Color,
        })),
        {
          id: "balance",
          name: (
            <span className="flex gap-2 items-center font-bold">
              GLOBAL BALANCE{" "}
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
