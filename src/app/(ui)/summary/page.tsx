"use client";

import React, { ReactNode, useState } from "react";
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
import { formatCurrency, getMonthBounds } from "@/config/utils";
import { TransactionType } from "@/interfaces/transaction";
import { CustomDateRangePicker } from "@/components/shared/CustomDateRangePicker";
import { parseAbsoluteToLocal, ZonedDateTime } from "@internationalized/date";
import { RangeValue } from "@react-types/shared";
import { CategoriesChart } from "@/components/charts/CategoriesChart";
import { ChipProps } from "@nextui-org/chip";
import { TransactionTypeDecorator } from "@/components/TransactionTypeDecorator";
import { HiFire } from "react-icons/hi";
import { FixedVsVariableChart } from "@/components/charts/FixedVsVariableChart";

type Color = ChipProps["color"];
const BALANCE_ALERT_THRESHOLD = 10_000_000; // FIXME: Move to config

function renderTable(
  columns: string[],
  data: { id: string; name: ReactNode; amount: number; color: Color }[]
) {
  return (
    <Table isCompact isStriped aria-label="Example static collection table">
      <TableHeader>
        <TableColumn>{columns[0]}</TableColumn>
        <TableColumn className="text-end">{columns[1]}</TableColumn>
      </TableHeader>
      <TableBody emptyContent={"No rows to display."}>
        {data.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="capitalize">{item.name}</TableCell>
            <TableCell className="text-end">
              <TransactionTypeDecorator color={item.color}>
                {formatCurrency(item.amount)}
              </TransactionTypeDecorator>
            </TableCell>
          </TableRow>
        )) ?? []}
      </TableBody>
    </Table>
  );
}

const currentMonthBounds = getMonthBounds(new Date());

function Summary() {
  const [dateWithin, setDateWithin] = useState<RangeValue<ZonedDateTime>>({
    start: parseAbsoluteToLocal(currentMonthBounds.start.toISOString()),
    end: parseAbsoluteToLocal(currentMonthBounds.end.toISOString()),
  });
  const dateWithinStart = dateWithin.start.toDate().toISOString();
  const dateWithinEnd = dateWithin.end.toDate().toISOString();
  const { isLoading, data: response } = useSWR<GetSummaryResponse, Error>(
    `/api/summary?start=${dateWithinStart}&end=${dateWithinEnd}`
  );

  const tiles = [
    {
      title: "Accounts balance",
      data:
        response?.summary?.accountsBalance &&
        renderTable(
          ["ACCOUNT", "BANLANCE"],
          [
            ...response?.summary?.accountsBalance.map((account) => ({
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
                  {response?.summary?.totalBalance <
                    BALANCE_ALERT_THRESHOLD && (
                    <HiFire className="text-lg text-red-500" />
                  )}
                </span>
              ),
              amount: response?.summary?.totalBalance,
              color: "primary" as Color,
            },
          ]
        ),
    },
    {
      title: "Transactions by Type",
      data:
        response?.summary?.byType &&
        renderTable(
          ["TYPE", "AMOUNT"],
          response?.summary?.byType
            .map((type) => ({
              id: type.type,
              name: type.type,
              amount:
                type.total * (type.type === TransactionType.INCOME ? 1 : -1),
              color: (type.type === TransactionType.INCOME
                ? "success"
                : type.type === TransactionType.EXPENSE
                ? "danger"
                : "warning") as Color,
            }))
            .sort((a, b) => b.amount - a.amount)
        ),
    },
    {
      title: "Transactions by Category",
      data: response?.summary?.byCategory && (
        <CategoriesChart
          data={response?.summary?.byCategory}
          detail={response?.transactions}
        />
      ),
    },
    {
      title: "Recurrent vs Variable transactions",
      data: response?.summary?.recurrentVsVariable && (
        <FixedVsVariableChart data={response?.summary?.recurrentVsVariable} />
      ),
    },
  ];

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col w-full justify-start items-start gap-2">
        <h1 className="page-title">A summary of how your money flows 💸</h1>
      </div>
      <div className="flex flex-row justify-items-stretch gap-2 w-full md:w-fit">
        <CustomDateRangePicker
          label="Filter the summary by date"
          variant="bordered"
          granularity="day"
          isRequired
          value={dateWithin}
          onChange={setDateWithin}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 grid-flow-row items-start gap-4">
        {isLoading && <span>Loading...</span>}
        {!isLoading &&
          tiles.map((tile, index) => (
            <div
              key={index}
              className="w-full flex flex-row flex-wrap justify-start"
            >
              <span className="subtitle text-lg font-bold my-2">
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
