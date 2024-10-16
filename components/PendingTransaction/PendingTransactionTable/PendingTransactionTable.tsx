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
import { TableSkeleton } from "./TableSkeleton";
import { useMutateTransaction } from "@/hooks/useMutateTransaction";
import { DeleteTableItemButton } from "../../DeleteTableItemButton";
import { Button } from "@nextui-org/button";
import { CompleteTransactionModalForm } from "../CompleteTransactionModalForm/CompleteTransactionModalForm";
import { useState } from "react";
import { IconCheckCircle } from "@/components/shared/icons";
import { useRenderCell } from "./Columns";

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
  const { columns, renderCell } = useRenderCell();

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
      <Table isStriped isCompact aria-label="Pending Transactions">
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn key={column.key} className={`${column.className}`}>
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          items={transactions}
          emptyContent={"No transactions to display."}
        >
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => {
                if (columnKey === "actions") {
                  return (
                    <TableCell>
                      <div className="flex flex-row justify-center">
                        <DeleteTableItemButton
                          itemId={item.id}
                          isDisabled={isMutating}
                          deleteTableItem={deleteTransaction}
                        />
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
                      </div>
                    </TableCell>
                  );
                }
                return renderCell(columnKey, item);
              }}
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
