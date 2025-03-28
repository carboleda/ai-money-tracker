"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/table";
import { Transaction } from "@/interfaces/transaction";
import { TableSkeleton } from "./TableSkeleton";
import { useMutateTransaction } from "@/hooks/useMutateTransaction";
import { DeleteTableItemButton } from "../../DeleteTableItemButton";
import { Button } from "@heroui/button";
import { CompleteTransactionModalForm } from "../CompleteTransactionModalForm/CompleteTransactionModalForm";
import { useCallback, useMemo, useState } from "react";
import { IconCheckCircle } from "@/components/shared/icons";
import { useRenderCell } from "./Columns";
import { Input } from "@heroui/input";
import { HiOutlineSearch } from "react-icons/hi";

interface PendingTransactionTableProps {
  isLoading: boolean;
  pendingTransactions: Transaction[] | undefined;
}

export const PendingTransactionTable: React.FC<PendingTransactionTableProps> = ({
  isLoading,
  pendingTransactions,
}) => {
  const [selectedItem, setSelectedItem] = useState<Transaction>();
  const [isOpen, setOpen] = useState(false);
  const [filterValue, setFilterValue] = useState("");
  const { isMutating, deleteTransaction } = useMutateTransaction();
  const { columns, renderCell } = useRenderCell();

  const transactions = useMemo(() => {
    if (!pendingTransactions) return pendingTransactions;

    let filteredPendingTransations = [...pendingTransactions];

    if (filterValue) {
      filteredPendingTransations = filteredPendingTransations.filter(
        (transaction) =>
          transaction.description
            .toLowerCase()
            .includes(filterValue.toLowerCase()) ||
          transaction.category
            ?.toLowerCase()
            .includes(filterValue.toLowerCase())
      );
    }

    return filteredPendingTransations;
  }, [pendingTransactions, filterValue]);

  const onConfirm = useCallback((item: Transaction) => {
    setSelectedItem(item);
    setOpen(true);
  }, []);

  const onDialogDismissed = useCallback(() => {
    setSelectedItem(undefined);
    setOpen(false);
  }, []);

  const onSearchChange = useCallback((value?: string) => {
    setFilterValue(value || "");
  }, []);

  const onClear = useCallback(() => {
    setFilterValue("");
  }, []);

  const renderTopContent = () => (
    <div className="flex flex-row gap-4">
      <div className="flex justify-between gap-3 items-center w-full">
        <Input
          radius="md"
          variant="faded"
          classNames={{ inputWrapper: "py-6" }}
          className="w-full sm:max-w-[44%]"
          placeholder="Search by description..."
          startContent={<HiOutlineSearch />}
          value={filterValue}
          onClear={() => onClear()}
          onValueChange={onSearchChange}
          isClearable
        />
        <span className="w-fit text-end subtitle text-sm">
          Total {pendingTransactions?.length} pending transactions
        </span>
      </div>
    </div>
  );

  if (isLoading || !transactions) return <TableSkeleton />;

  return (
    <>
      <Table
        isStriped
        isCompact
        aria-label="Pending Transactions"
        topContentPlacement="outside"
        topContent={renderTopContent()}
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
          emptyContent={"You're up to date, well done 👏!."}
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
                          color="success"
                          variant="light"
                          className="self-center"
                          aria-label="Confirm"
                          onPress={() => onConfirm(item)}
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
        isOpen={isOpen}
        onDismiss={onDialogDismissed}
      />
    </>
  );
};
