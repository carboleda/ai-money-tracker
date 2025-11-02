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
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";
import { SearchToolbar } from "@/components/Transactions/SearchToolbar";
import { useTableHeight } from "@/hooks/useTableHeight";

interface PendingTransactionTableProps {
  isLoading: boolean;
  pendingTransactions: Transaction[] | undefined;
}

export const PendingTransactionTable: React.FC<
  PendingTransactionTableProps
> = ({ isLoading, pendingTransactions }) => {
  const { t } = useTranslation(LocaleNamespace.RecurrentExpenses);
  const [selectedItem, setSelectedItem] = useState<Transaction>();
  const [isOpen, setOpen] = useState(false);
  const [filterValue, setFilterValue] = useState("");
  const { isMutating, deleteTransaction } = useMutateTransaction();
  const { columns, renderCell, rowHeight } = useRenderCell();
  const { maxTableHeight } = useTableHeight();

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

  const renderTopContent = () => (
    <div className="flex flex-row gap-4">
      <div className="flex justify-between gap-3 items-center w-full">
        <SearchToolbar
          filterValue={filterValue}
          onSearchChange={setFilterValue}
        />
        <span className="w-fit text-end text-sm text-default-500">
          {t("pendingTransactionCountMessage", {
            count: transactions?.length || 0,
          })}
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
        isVirtualized
        maxTableHeight={maxTableHeight}
        rowHeight={rowHeight}
        aria-label={t("pendingTransactions")}
        topContentPlacement="outside"
        topContent={renderTopContent()}
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn key={column.key} className={`${column.className}`}>
              {t(column.key)}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          items={transactions}
          emptyContent={t("management.emptyContent")}
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
                          aria-label={t("confirm")}
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
                return renderCell({
                  key: columnKey,
                  item,
                  onEdit: onConfirm,
                  onDelete: deleteTransaction,
                });
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
