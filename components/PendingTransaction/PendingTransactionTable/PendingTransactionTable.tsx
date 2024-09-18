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
import { TransactionTypeDecorator } from "../../TransactionTypeDecorator";
import { TableSkeleton } from "./TableSkeleton";
import { useMutateTransaction } from "@/hooks/useMutateTransaction";
import { DeleteTableItemButton } from "../../DeleteTableItemButton";
import { Button } from "@nextui-org/button";
import { Chip } from "@nextui-org/chip";
import { formatCurrency, formatDate } from "@/config/utils";
import { CompleteTransactionModalForm } from "../CompleteTransactionModalForm/CompleteTransactionModalForm";
import { useState } from "react";
import { IconCheckCircle } from "@/components/shared/icons";

interface PendingTransactionTableProps {
  isLoading: boolean;
  transactions: Transaction[] | undefined;
  accounts?: { [key: string]: string };
}

export const PendingTransactionTable: React.FC<
  PendingTransactionTableProps
> = ({ isLoading, transactions, accounts }) => {
  const [selectedItem, setSelectedItem] = useState<Transaction>();
  const [isOpen, setOpen] = useState(false);
  const { isMutating, deleteTransaction } = useMutateTransaction();

  if (isLoading || !transactions) return <TableSkeleton />;

  const onConfirm = (item: Transaction) => {
    setSelectedItem(item);
    setOpen(true);
  };

  const onDialogDismissed = () => {
    setSelectedItem(undefined);
    setOpen(false);
  };

  return (
    <>
      <Table
        isStriped
        isCompact
        aria-label="Pending Transactions"
        // onRowAction={(key) => onRowAction(key as string)}
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
                  <Button
                    isIconOnly
                    color="success"
                    variant="light"
                    className="self-center"
                    aria-label="Confirm"
                    onClick={() => onConfirm(item)}
                  >
                    <IconCheckCircle />
                  </Button>
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
      <CompleteTransactionModalForm
        item={selectedItem}
        accounts={accounts}
        isOpen={isOpen}
        onDismiss={onDialogDismissed}
      />
    </>
  );
};
