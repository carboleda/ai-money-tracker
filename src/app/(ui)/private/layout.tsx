"use client";

import "@/styles/globals.css";
import FcmProvider from "@/components/providers/FcmProvider";
import { Sidebar } from "@/components/shared/Sidebar/Sidebar";
import { firebaseApp } from "@/firebase/client";
import { Navbar } from "@/components/shared/Navbar";
import { PropsWithChildren } from "react";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { AddTransactionEntryPoints } from "@/components/features/Transactions/AddTransactionModal/AddTransactionEntryPoints";

export default function PrivateLayout({
  children,
}: Readonly<PropsWithChildren>) {
  return (
    <section>
      <FcmProvider firebaseApp={firebaseApp} />
      <Sidebar>
        <Navbar />
        <AuthGuard>{children}</AuthGuard>
      </Sidebar>
      <AddTransactionEntryPoints />
    </section>
  );
}
