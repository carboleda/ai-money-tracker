"use client";

import React, { useState } from "react";
import useSWR from "swr";
import { withAuth } from "@/app/(ui)/withAuth";
import { GetSummaryResponse } from "@/interfaces/summary";
import { getMonthBounds } from "@/config/utils";
import { TransactionType } from "@/interfaces/transaction";
import { CustomDateRangePicker } from "@/components/shared/CustomDateRangePicker";
import { parseAbsoluteToLocal, ZonedDateTime } from "@internationalized/date";
import { RangeValue } from "@react-types/shared";
import { CategoriesChart } from "@/components/charts/CategoriesChart";
import { ChipProps } from "@nextui-org/chip";
import { FixedVsVariableChart } from "@/components/charts/FixedVsVariableChart";
import { TileTable } from "@/components/Summary/TileTable";
import { Tiles } from "@/components/Summary/Tiles";
import { AccountsBalanceTitle } from "@/components/Summary/AccountsBalanceTitle";
import { TransactionsByTypeTitle } from "@/components/Summary/TransactionsByTypeTitle";

type Color = ChipProps["color"];

const currentMonthBounds = getMonthBounds(new Date());

function Summary() {
  const [dateWithin, setDateWithin] = useState<RangeValue<ZonedDateTime>>({
    start: parseAbsoluteToLocal(currentMonthBounds.start.toISOString()),
    end: parseAbsoluteToLocal(currentMonthBounds.end.toISOString()),
  });
  const dateWithinStart = dateWithin.start.toDate().toISOString();
  const dateWithinEnd = dateWithin.end.toDate().toISOString();
  const { data: response } = useSWR<GetSummaryResponse, Error>(
    `/api/summary?start=${dateWithinStart}&end=${dateWithinEnd}`
  );

  const tiles = [
    {
      title: "Accounts balance",
      data: (
        <AccountsBalanceTitle
          accountsBalance={response?.summary?.accountsBalance}
          totalBalance={response?.summary?.totalBalance}
        />
      ),
    },
    {
      title: "Transactions by type",
      data: <TransactionsByTypeTitle byType={response?.summary?.byType} />,
    },
    {
      title: "Transactions by category",
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

      <Tiles tiles={tiles} />
    </section>
  );
}

export default withAuth(Summary);
