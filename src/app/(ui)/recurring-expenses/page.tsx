import React from "react";
import { withAuth } from "@/app/(ui)/withAuth";
import PageContent from "@/components/RecurringExpenses/PageContent";

function RecurringExpenses() {
  return <PageContent />;
}

export default withAuth(RecurringExpenses);
