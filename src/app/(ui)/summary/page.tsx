import React from "react";
import { withAuth } from "@/app/(ui)/withAuth";
import PageContent from "@/components/Summary/PageContent";

function Summary() {
  return <PageContent />;
}

export default withAuth(Summary);
