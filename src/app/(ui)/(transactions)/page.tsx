import React from "react";
import { withAuth } from "@/app/(ui)/withAuth";
import PageContent from "@/components/Transactions/PageContent";

function Transactions() {
  return <PageContent />;
}

export default withAuth(Transactions);
