"use client";

import { Table } from "@heroui/react";
import { TableSkeleton } from "@/components/shared/Table/TableSkeleton";
import { useMutateTransaction } from "@/hooks/useMutateTransaction";
import { CompleteTransactionModalForm } from "../CompleteTransactionModalForm/CompleteTransactionModalForm";
import { useCallback, useMemo, useState } from "react";
import { useRenderCell } from "./Columns";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";
import { SearchToolbar } from "@/components/features/Transactions/SearchToolbar";
import { TransactionOutput } from "@/app/api/domain/transaction/ports/outbound/filter-transactions.port";
import { useDeleteTableItem } from "@/hooks/useDeleteTableItem";
import { TableToolbar } from "@/components/shared/Table/TableToolbar";
import { useTableSelection } from "@/hooks/useTableSelection";
import { TableContainer } from "@/components/shared/Table/TableContainer";

interface PendingTransactionTableProps {
  isLoading: boolean;
  pendingTransactions: TransactionOutput[] | undefined;
}

export const PendingTransactionTable: React.FC<
  PendingTransactionTableProps
> = ({ isLoading, pendingTransactions }) => {
  const { t } = useTranslation(LocaleNamespace.RecurringExpenses);
  const [isOpen, setIsOpen] = useState(false);
  const [filterValue, setFilterValue] = useState("");
  const { isMutating, deleteTransaction } = useMutateTransaction();
  const { columns, renderCell } = useRenderCell();
  const { onDelete } = useDeleteTableItem({
    onConfirmDelete: deleteTransaction,
  });

  const transactions = useMemo(() => {
    if (!pendingTransactions) return pendingTransactions;

    let filteredPendingTransations = [...pendingTransactions];

    if (filterValue) {
      filteredPendingTransations = filteredPendingTransations.filter(
        (transaction) =>
          transaction.description
            .toLowerCase()
            .includes(filterValue.toLowerCase()) ||
          transaction.category?.name
            ?.toLowerCase()
            .includes(filterValue.toLowerCase()),
      );
    }

    return filteredPendingTransations;
  }, [pendingTransactions, filterValue]);

  const {
    selectedItem,
    setSelectedItem,
    selectedKeys,
    onSelectionChange,
    clearSelection,
  } = useTableSelection({ items: transactions, isMutating });

  const onConfirm = useCallback(
    (item: TransactionOutput) => {
      setSelectedItem(item);
      setIsOpen(true);
    },
    [setSelectedItem],
  );

  const onDialogDismissed = useCallback(() => {
    clearSelection();
    setIsOpen(false);
  }, [clearSelection]);

  const renderTopContent = () => (
    <div className="flex w-full flex-row gap-4">
      <div className="flex justify-between gap-3 items-center w-full">
        <SearchToolbar
          filterValue={filterValue}
          onSearchChange={setFilterValue}
        />
      </div>
    </div>
  );

  if (isLoading || !transactions) return <TableSkeleton />;

  return (
    <>
      {renderTopContent()}
      <Table>
        <TableToolbar
          selectedItem={selectedItem}
          isMutating={isMutating}
          rowCount={transactions?.length}
          t={t}
        >
          <TableToolbar.ConfirmAction
            noSeparator
            onPress={onConfirm}
            labelKey="completeTransationButton"
          />
          <TableToolbar.DeleteAction
            onPress={(item) => onDelete(item.id, item.description)}
          />
        </TableToolbar>
        <TableContainer
          t={t}
          ariaLabelKey="pendingTransactions"
          emptyContentLabelKey="management.emptyContent"
          renderCell={renderCell}
          columns={columns}
          items={transactions}
          onSelectionChange={onSelectionChange}
          selectedKeys={selectedKeys}
        />
      </Table>
      <CompleteTransactionModalForm
        item={selectedItem}
        isOpen={isOpen}
        onDismiss={onDialogDismissed}
      />
    </>
  );
};
