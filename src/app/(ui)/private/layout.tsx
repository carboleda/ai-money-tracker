"use client";

import "@/styles/globals.css";
import FcmProvider from "@/components/providers/FcmProvider";
import { Sidebar } from "@/components/shared/Sidebar/Sidebar";
import { firebaseApp } from "@/firebase/client";
import { Navbar } from "@/components/shared/Navbar";
import { PropsWithChildren } from "react";
import { AuthGuard } from "@/components/shared/AuthGuard";

export default function PrivateLayout({
  children,
}: Readonly<PropsWithChildren>) {
  return (
    <AuthGuard>
      <section>
        <FcmProvider firebaseApp={firebaseApp} />
        <Sidebar>
          <Navbar />
          {children}
        </Sidebar>
      </section>
    </AuthGuard>
  );
}
