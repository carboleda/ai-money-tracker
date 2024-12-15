"use client";

import React, { useState } from "react";
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
import { CategoriesChart } from "@/components/CategoriesChart";
import { Chip, ChipProps } from "@nextui-org/chip";

type Color = ChipProps["color"];

function renderTable(
  columns: string[],
  data: { id: string; name: string; amount: number; color: Color }[]
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
              <Chip radius="sm" variant="flat" size="md" color={item.color}>
                {formatCurrency(item.amount)}
              </Chip>
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
        response?.accountsBalance &&
        renderTable(
          ["ACCOUNT", "BANLANCE"],
          [
            ...response.accountsBalance.map((account) => ({
              id: account.id,
              name: account.account,
              amount: account.balance,
              color: (account.balance > 0 ? "success" : "danger") as Color,
            })),
            {
              id: "balance",
              name: "Balance",
              amount: response.totalBalance,
              color: (response.totalBalance > 0
                ? "primary"
                : "danger") as Color,
            },
          ]
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
              color: (type.type === TransactionType.INCOME
                ? "success"
                : "danger") as Color,
            }))
            .sort((a, b) => b.amount - a.amount)
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
              <span className="subtitle text-xl font-bold my-2">
                {tile.title}
              </span>
              {tile.data}
            </div>
          ))}

        <div className="w-full flex flex-row flex-wrap justify-start">
          {!isLoading && (
            <span className="subtitle text-xl font-bold my-2">
              Movements by Category
            </span>
          )}
          {!isLoading && <CategoriesChart data={response?.byCategory} />}
        </div>
      </div>
    </section>
  );
}

export default withAuth(Summary);
