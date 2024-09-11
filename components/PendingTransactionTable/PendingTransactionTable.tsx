"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/table";
import { Transaction } from "@/interfaces/transaction";
import { TransactionTypeDecorator } from "../TransactionTypeDecorator";
import { TableSkeleton } from "./TableSkeleton";
import { useMutateTransaction } from "@/hooks/useMutateTransaction";
import { DeleteTableItemButton } from "../DeleteTableItemButton";
import { Chip } from "@nextui-org/chip";
import { formatCurrency, formatDate } from "@/config/utils";

interface PendingTransactionTableProps {
  isLoading: boolean;
  transactions: Transaction[] | undefined;
}

export const PendingTransactionTable: React.FC<
  PendingTransactionTableProps
> = ({ isLoading, transactions }) => {
  const { isMutating, deleteTransaction } = useMutateTransaction();

  if (isLoading || !transactions) return <TableSkeleton />;

  const onRowAction = (key: string) => {
    const transaction = transactions.find((t) => t.id === key);
    console.log("transaction", transaction);
  };

  return (
    <>
      <Table
        isStriped
        isCompact
        aria-label="Pending Transactions"
        onRowAction={(key) => onRowAction(key as string)}
      >
        <TableHeader>
          <TableColumn>DATE</TableColumn>
          <TableColumn>DESCRIPTION</TableColumn>
          <TableColumn className="text-end">AMOUNT</TableColumn>
          <TableColumn className="text-center">ACTIONS</TableColumn>
        </TableHeader>
        <TableBody
          items={transactions}
          emptyContent={"No transactions to display."}
        >
          {(item) => (
            <TableRow key={item.id}>
              <TableCell>{formatDate(new Date(item.createdAt))}</TableCell>
              <TableCell>
                <div className="flex flex-col items-start gap-2">
                  <span className="text-gray-400">
                    {item.description}{" "}
                    {item.category && (
                      <Chip radius="sm" variant="flat">
                        {item.category}
                      </Chip>
                    )}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-end">
                <TransactionTypeDecorator type={item.type}>
                  {formatCurrency(item.amount)}
                </TransactionTypeDecorator>
              </TableCell>
              <TableCell>
                <div className="flex flex-row justify-center">
                  <DeleteTableItemButton
                    itemId={item.id}
                    isDisabled={isMutating}
                    deleteTableItem={deleteTransaction}
                  />
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  );
};
