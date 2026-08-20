"use client";

import { Button, Table } from "@heroui/react";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { useMutateTransaction } from "@/hooks/useMutateTransaction";
import { DeleteTableItemButton } from "@/components/DeleteTableItemButton";
import { useRenderCell } from "./Columns";
import { IconEdit } from "@/components/shared/icons";
import { useState } from "react";
import { UpdateTransactionModalForm } from "@/components/features/Transactions/UpdateTransactionModalForm";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";
import { useTableHeight } from "@/hooks/useTableHeight";
import { TransactionOutput } from "@/app/api/domain/transaction/ports/outbound/filter-transactions.port";
import { EmptyTableState } from "@/components/shared/EmptyTableState";

interface TranactionTableProps {
  isLoading: boolean;
  transactions?: TransactionOutput[];
}

export const TransactionTable: React.FC<TranactionTableProps> = ({
  isLoading,
  transactions,
}) => {
  const { t } = useTranslation(LocaleNamespace.Transactions);
  const [selectedItem, setSelectedItem] = useState<TransactionOutput>();
  const [isOpen, setIsOpen] = useState(false);
  const { isMutating, deleteTransaction } = useMutateTransaction();
  const { columns, renderCell } = useRenderCell();
  const { maxTableHeight } = useTableHeight();

  const onDialogDismissed = () => {
    setSelectedItem(undefined);
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
        <Table.ScrollContainer
          className="overflow-y-auto"
          style={{ maxHeight: maxTableHeight }}
        >
          <Table.Content aria-label={t("subtitle")}>
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
                      if (column.key === "actions") {
                        return (
                          <Table.Cell>
                            <div className="flex flex-col gap-1 items-center md:flex-row md:justify-center">
                              <Button
                                isIconOnly
                                variant="tertiary"
                                className="self-center text-warning"
                                aria-label={t("edit")}
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
                          </Table.Cell>
                        );
                      }

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
