"use client";

import { Table } from "@heroui/react";
import { TableSkeleton } from "@/components/shared/Table/TableSkeleton";
import { useMutateTransaction } from "@/hooks/useMutateTransaction";
import { useRenderCell } from "./Columns";
import { useState } from "react";
import { UpdateTransactionModalForm } from "@/components/features/Transactions/UpdateTransactionModalForm";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";
import { TransactionOutput } from "@/app/api/domain/transaction/ports/outbound/filter-transactions.port";
import { useDeleteTableItem } from "@/hooks/useDeleteTableItem";
import { TableToolbar } from "@/components/shared/Table/TableToolbar";
import { useTableSelection } from "@/hooks/useTableSelection";
import { TableContainer } from "@/components/shared/Table/TableContainer";

interface TranactionTableProps {
  isLoading: boolean;
  transactions?: TransactionOutput[];
}

export const TransactionTable: React.FC<TranactionTableProps> = ({
  isLoading,
  transactions,
}) => {
  const { t } = useTranslation(LocaleNamespace.Transactions);
  const [isOpen, setIsOpen] = useState(false);
  const { isMutating, deleteTransaction } = useMutateTransaction();
  const { columns, renderCell } = useRenderCell();
  const { onDelete } = useDeleteTableItem({
    onConfirmDelete: deleteTransaction,
  });

  const {
    selectedItem,
    setSelectedItem,
    selectedKeys,
    onSelectionChange,
    clearSelection,
  } = useTableSelection({ items: transactions, isMutating });

  const onDialogDismissed = () => {
    clearSelection();
    setIsOpen(false);
  };

  const onEdit = (item: TransactionOutput) => {
    setSelectedItem(item);
    setIsOpen(true);
  };

  if (isLoading || !transactions) return <TableSkeleton />;

  return (
    <>
      <Table>
        <TableToolbar
          selectedItem={selectedItem}
          isMutating={isMutating}
          rowCount={transactions?.length}
          t={t}
        >
          <TableToolbar.EditAction noSeparator onPress={onEdit} />
          <TableToolbar.DeleteAction
            onPress={(item: TransactionOutput) =>
              onDelete(item.id, item.description)
            }
          />
        </TableToolbar>
        <TableContainer
          t={t}
          ariaLabelKey="subtitle"
          renderCell={renderCell}
          columns={columns}
          items={transactions}
          onSelectionChange={onSelectionChange}
          selectedKeys={selectedKeys}
        />
      </Table>
      <UpdateTransactionModalForm
        item={selectedItem}
        isOpen={isOpen}
        onDismiss={onDialogDismissed}
      />
    </>
  );
};
