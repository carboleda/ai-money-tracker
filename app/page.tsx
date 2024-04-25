"use client";

import React from "react";
import { SearchIcon } from "@/components/icons";
import { Input } from "@nextui-org/input";
import { Kbd } from "@nextui-org/kbd";
import { TransactionTable } from "@/components/TransactionTable";

export default function Home() {
  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <Input
        aria-label="Search"
        classNames={{
          inputWrapper: "bg-default-100",
          input: "text-sm",
        }}
        endContent={
          <Kbd className="hidden lg:inline-block" keys={["command"]}>
            K
          </Kbd>
        }
        labelPlacement="outside"
        placeholder="Buy groceries by 1000 using account C1234"
        startContent={
          <SearchIcon className="text-base text-default-400 pointer-events-none flex-shrink-0" />
        }
        type="search"
      />

      <TransactionTable />
    </section>
  );
}
