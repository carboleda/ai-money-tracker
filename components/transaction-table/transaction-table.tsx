"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/table";
import useSWR from "swr";
import { ApiResponse } from "@/interfaces/global";
import { Transaction } from "@/interfaces/transaction";
import { TransactionTypeDecorator } from "../transaction-type";
import { TableSkeleton } from "./skeleton";

const formater = new Intl.NumberFormat();

export const TransactionTable = () => {
  let { data: reesponse, error } = useSWR<ApiResponse<Transaction[]>, Error>(
    "/api/transactions"
  );

  if (error) return <div>Failed to load</div>;
  if (!reesponse?.data) return <TableSkeleton />;

  const rows = reesponse.data;

  return (
    <>
      <Table aria-label="Transactions">
        <TableHeader>
          <TableColumn>Description</TableColumn>
          <TableColumn>Amount</TableColumn>
        </TableHeader>
        <TableBody items={rows}>
          {(item) => (
            <TableRow key={item.id}>
              <TableCell className="flex flex-col items-start gap-2">
                <div>
                  <span>{item.sourceAccount}</span>
                  {item.destinationAccount && (
                    <span> &#10141; {item.destinationAccount}</span>
                  )}
                </div>
                <span className="text-gray-400">
                  {item.category} ({item.description})
                </span>
              </TableCell>
              <TableCell>
                <TransactionTypeDecorator type={item.type}>
                  {formater.format(item.amount)}
                </TransactionTypeDecorator>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  );
};
