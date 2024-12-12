"use client";

import React from "react";
import useSWR from "swr";
import { withAuth } from "@/app/(ui)/withAuth";
import { GetSummaryResponse } from "@/interfaces/summary";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/table";
import { formatCurrency } from "@/config/utils";
import { TransactionTypeDecorator } from "@/components/TransactionTypeDecorator";
import { TransactionType } from "@/interfaces/transaction";

function renderTable(
  columns: string[],
  data: { id: string; name: string; amount: number }[]
) {
  return (
    <Table aria-label="Example static collection table">
      <TableHeader>
        <TableColumn>{columns[0]}</TableColumn>
        <TableColumn className="text-end">{columns[1]}</TableColumn>
      </TableHeader>
      <TableBody emptyContent={"No rows to display."}>
        {data.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="capitalize">{item.name}</TableCell>
            <TableCell className="text-end">
              <TransactionTypeDecorator
                type={
                  item.amount > 0
                    ? TransactionType.INCOME
                    : TransactionType.EXPENSE
                }
              >
                {formatCurrency(item.amount)}
              </TransactionTypeDecorator>
            </TableCell>
          </TableRow>
        )) ?? []}
      </TableBody>
    </Table>
  );
}

function Summary() {
  const { isLoading, data: response } = useSWR<GetSummaryResponse, Error>(
    `/api/summary`
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const tiles = [
    {
      title: "Accounts balance",
      data:
        response?.accountsBalance &&
        renderTable(
          ["ACCOUNT", "BANLANCE"],
          response.accountsBalance.map((account) => ({
            id: account.id,
            name: account.account,
            amount: account.balance,
          }))
        ),
    },
    {
      title: "Movements by account",
      data:
        response?.accountsBalance &&
        renderTable(
          ["ACCOUNT", "BANLANCE"],
          response.byAccount.map((account) => ({
            id: account.id,
            name: account.account,
            amount: account.balance,
          }))
        ),
    },
    {
      title: "Movements by Type",
      data:
        response?.byType &&
        renderTable(
          ["TYPE", "AMOUNT"],
          response.byType
            .map((type) => ({
              id: type.type,
              name: type.type,
              amount:
                type.total * (type.type === TransactionType.INCOME ? 1 : -1),
            }))
            .sort((a, b) => b.amount - a.amount)
        ),
    },
  ];

  return (
    <section className="flex flex-col gap-2">
      <div className="flex flex-col w-full justify-start items-start gap-2">
        <h1 className="page-title">A summary of how your money flows 💸</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 grid-flow-row items-start gap-4">
        {tiles.map((tile, index) => (
          <div
            key={index}
            className="w-full flex flex-row flex-wrap justify-start"
          >
            <span className="subtitle text-xl font-bold my-2">
              {tile.title}
            </span>
            {tile.data}
          </div>
        ))}
      </div>
    </section>
  );
}

export default withAuth(Summary);
