"use client";

import React from "react";
import useSWR from "swr";
import { ConfigRecurringExpensesTable } from "@/components/RecurringExpenses/ConfigTable/ConfigTable";
import { GetRecurringExpensesConfigResponse } from "@/interfaces/recurringExpense";

export default function ConfigRecurringExpenses() {
  const { isLoading, data: reesponse } = useSWR<
    GetRecurringExpensesConfigResponse,
    Error
  >("/api/recurring-expenses/config");

  return (
    <section className="flex flex-col items-center justify-center gap-4">
      <ConfigRecurringExpensesTable
        recurringExpenses={reesponse?.recurringExpensesConfig}
        isLoading={isLoading}
      />
    </section>
  );
}
