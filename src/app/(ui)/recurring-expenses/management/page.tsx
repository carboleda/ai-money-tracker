import React from "react";
import { withAuth } from "@/app/(ui)/withAuth";
import PageContent from "@/components/PendingTransaction/PageContent";

function PendingTransactions() {
  return <PageContent />;
}
export default withAuth(PendingTransactions);
