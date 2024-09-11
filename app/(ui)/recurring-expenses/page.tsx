"use client";

import React from "react";
import useSWR from "swr";
import { RecurringExpensesTable } from "@/components/RecurringExpenses";
import { GetRecurringExpensesResponse } from "@/interfaces/recurringExpense";

export default function RecurringExpenses() {
  const { isLoading, data: reesponse } = useSWR<
    GetRecurringExpensesResponse,
    Error
  >("/api/recurring-expenses");

  return (
    <section className="flex flex-col items-center justify-center gap-4">
      <RecurringExpensesTable
        recurringExpenses={reesponse?.recurringExpensesConfig}
        isLoading={isLoading}
      />
    </section>
  );
}
