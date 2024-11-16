"use client";

import React from "react";
import useSWR from "swr";
import { withAuth } from "@/app/(ui)/withAuth";
import { GetAccountsResponse } from "@/interfaces/account";
import { TransactionTypeDecorator } from "@/components/TransactionTypeDecorator";
import { TransactionType } from "@/interfaces/transaction";
import { formatCurrency } from "@/config/utils";

function Summary() {
  const { isLoading, data: response } = useSWR<GetAccountsResponse, Error>(
    `/api/accounts`
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <section className="flex flex-col items-center justify-center gap-4">
      <div className="flex flex-col w-full justify-start items-start gap-2">
        <h1 className="page-title">All your transactions</h1>
      </div>

      <ul>
        {response?.accounts?.map((account) => {
          return (
            <li key={account.id} className="flex flex-row items-center gap-2">
              <h2>{account.account}</h2>
              <TransactionTypeDecorator
                type={
                  account.balance > 0
                    ? TransactionType.INCOME
                    : TransactionType.EXPENSE
                }
              >
                {formatCurrency(account.balance)}
              </TransactionTypeDecorator>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default withAuth(Summary);
