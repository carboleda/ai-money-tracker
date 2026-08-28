"use client";

import { Table } from "@heroui/react";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { useMutateTransaction } from "@/hooks/useMutateTransaction";
import { useRenderCell } from "./Columns";
import { useState } from "react";
import { UpdateTransactionModalForm } from "@/components/features/Transactions/UpdateTransactionModalForm";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";
import { useMeasuredTableHeight } from "@/hooks/useMeasuredTableHeight";
import { TransactionOutput } from "@/app/api/domain/transaction/ports/outbound/filter-transactions.port";
import { EmptyTableState } from "@/components/shared/EmptyTableState";
import { useDeleteTableItem } from "@/hooks/useDeleteTableItem";
import { TableToolbar } from "@/components/shared/TableToolbar/TableToolbar";
import { useTableSelection } from "@/hooks/useTableSelection";

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
  const { maxTableHeight, containerRef } = useMeasuredTableHeight();
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
        <Table.ScrollContainer
          ref={containerRef}
          className="overflow-y-auto"
          style={{ maxHeight: maxTableHeight }}
        >
          <Table.Content
            aria-label={t("subtitle")}
            selectionMode="single"
            selectedKeys={selectedKeys}
            onSelectionChange={onSelectionChange}
          >
            <Table.Header
              columns={columns}
              className="hidden md:table-header-group"
            >
              {(column) => (
                <Table.Column
                  key={column.key}
                  id={column.key}
                  className={column.className}
                  isRowHeader={column.isRowHeader}
                >
                  {t(column.key)}
                </Table.Column>
              )}
            </Table.Header>
            <Table.Body
              items={transactions}
              renderEmptyState={() => (
                <EmptyTableState message={t("emptyContent")} />
              )}
            >
              {(item) => (
                <Table.Row key={item.id} id={item.id}>
                  <Table.Collection items={columns}>
                    {(column) => {
                      return renderCell({
                        key: column.key,
                        item,
                        onEdit,
                        onDelete: deleteTransaction,
                      });
                    }}
                  </Table.Collection>
                </Table.Row>
              )}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>
      <UpdateTransactionModalForm
        item={selectedItem}
        isOpen={isOpen}
        onDismiss={onDialogDismissed}
      />
    </>
  );
};
