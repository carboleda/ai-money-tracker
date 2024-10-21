"use client";

import React from "react";
import useSWR from "swr";
import { RecurringExpensesTable } from "@/components/RecurringExpenses";
import { GetRecurringExpensesResponse } from "@/interfaces/recurringExpense";
import { withAuth } from "@/app/withAuth";

function RecurringExpenses() {
  const { isLoading, data: reesponse } = useSWR<
    GetRecurringExpensesResponse,
    Error
  >("/api/recurring-expenses");

  return (
    <section className="flex flex-col items-center justify-center gap-4">
      <div className="flex flex-row w-full justify-start gap-2">
        <h1 className="page-title">Configure your recurrent expenses</h1>
      </div>
      <RecurringExpensesTable
        recurringExpenses={reesponse?.recurringExpensesConfig}
        isLoading={isLoading}
      />
    </section>
  );
}

export default withAuth(RecurringExpenses);
