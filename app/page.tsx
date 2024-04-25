"use client";

import React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  getKeyValue,
} from "@nextui-org/table";
import { SearchIcon } from "@/components/icons";
import { Input } from "@nextui-org/input";
import { Kbd } from "@nextui-org/kbd";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const columns = [
  {
    key: "description",
    label: "Description",
  },
  {
    key: "category",
    label: "Category",
  },
  {
    key: "type",
    label: "Type",
  },
  {
    key: "sourceAccount",
    label: "Source Account",
  },
  {
    key: "amount",
    label: "Amount",
  },
];

export default function Home() {
  const { data, error } = useSWR<any, Error>(
    "http://localhost:3000/api/transactions",
    fetcher
  );
  if (error) return <div>Failed to load</div>;
  if (!data?.data) return <div>Loading...</div>;

  const rows = data.data as Iterable<any>;

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

      <Table aria-label="Example table with dynamic content">
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn key={column.key}>{column.label}</TableColumn>
          )}
        </TableHeader>
        <TableBody items={rows}>
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>{getKeyValue(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </section>
  );
}
