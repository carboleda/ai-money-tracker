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
import { DeleteTableItemButton } from "@/components/DeleteTableItemButton";
import { useRenderCell } from "./Columns";
import { Button } from "@nextui-org/button";
import { IconEdit } from "@/components/shared/icons";
import { useState } from "react";
import { UpdateTransactionModalForm } from "@/components/Transactions/UpdateTransactionModalForm";

interface TranactionTableProps {
  isLoading: boolean;
  topContent?: React.ReactNode;
  transactions?: Transaction[];
}

export const TransactionTable: React.FC<TranactionTableProps> = ({
  isLoading,
  topContent,
  transactions,
}) => {
  const [selectedItem, setSelectedItem] = useState<Transaction>();
  const [isOpen, setOpen] = useState(false);
  const { isMutating, deleteTransaction } = useMutateTransaction();
  const { columns, renderCell } = useRenderCell();

  const onDialogDismissed = () => {
    setSelectedItem(undefined);
    setOpen(false);
  };

  const onEdit = (item: Transaction) => {
    setSelectedItem(item);
    setOpen(true);
  };

  if (isLoading || !transactions) return <TableSkeleton />;

  return (
    <>
      <Table
        isStriped
        isCompact
        aria-label="Transactions"
        topContentPlacement="outside"
        topContent={topContent}
      >
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
                        <Button
                          isIconOnly
                          color="warning"
                          variant="light"
                          className="self-center"
                          aria-label="Edit"
                          onPress={() => onEdit(item)}
                        >
                          <IconEdit />
                        </Button>
                        <DeleteTableItemButton
                          itemId={item.id}
                          isDisabled={isMutating}
                          deleteTableItem={deleteTransaction}
                        />
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
      <UpdateTransactionModalForm
        item={selectedItem}
        isOpen={isOpen}
        onDismiss={onDialogDismissed}
      />
    </>
  );
};
