"use client";

import { Button, Table } from "@heroui/react";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { useMutateTransaction } from "@/hooks/useMutateTransaction";
import { DeleteTableItemButton } from "@/components/DeleteTableItemButton";
import { CompleteTransactionModalForm } from "../CompleteTransactionModalForm/CompleteTransactionModalForm";
import { useCallback, useMemo, useState } from "react";
import { useRenderCell } from "./Columns";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";
import { SearchToolbar } from "@/components/features/Transactions/SearchToolbar";
import { useTableHeight } from "@/hooks/useTableHeight";
import { FaRegCircleCheck } from "react-icons/fa6";
import { TransactionOutput } from "@/app/api/domain/transaction/ports/outbound/filter-transactions.port";

interface PendingTransactionTableProps {
  isLoading: boolean;
  pendingTransactions: TransactionOutput[] | undefined;
}

export const PendingTransactionTable: React.FC<
  PendingTransactionTableProps
> = ({ isLoading, pendingTransactions }) => {
  const { t } = useTranslation(LocaleNamespace.RecurringExpenses);
  const [selectedItem, setSelectedItem] = useState<TransactionOutput>();
  const [isOpen, setIsOpen] = useState(false);
  const [filterValue, setFilterValue] = useState("");
  const { isMutating, deleteTransaction } = useMutateTransaction();
  const { columns, renderCell } = useRenderCell();
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
          transaction.category?.name
            ?.toLowerCase()
            .includes(filterValue.toLowerCase())
      );
    }

    return filteredPendingTransations;
  }, [pendingTransactions, filterValue]);

  const onConfirm = useCallback((item: TransactionOutput) => {
    setSelectedItem(item);
    setIsOpen(true);
  }, []);

  const onDialogDismissed = useCallback(() => {
    setSelectedItem(undefined);
    setIsOpen(false);
  }, []);

  const renderTopContent = () => (
    <div className="flex w-full flex-row gap-4">
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
      {renderTopContent()}
      <Table>
        <Table.ScrollContainer
          className="overflow-y-auto"
          style={{ maxHeight: maxTableHeight }}
        >
          <Table.Content aria-label={t("pendingTransactions")}>
            <Table.Header columns={columns}>
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
              renderEmptyState={() => <span>{t("management.emptyContent")}</span>}
            >
              {(item) => (
                <Table.Row key={item.id} id={item.id}>
                  <Table.Collection items={columns}>
                    {(column) => {
                      if (column.key === "actions") {
                        return (
                          <Table.Cell>
                            <div className="flex flex-row justify-center">
                              <Button
                                isIconOnly
                                variant="tertiary"
                                className="self-center text-success"
                                aria-label={t("confirm")}
                                onPress={() => onConfirm(item)}
                              >
                                <FaRegCircleCheck className="text-xl" />
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
                        onEdit: onConfirm,
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
      <CompleteTransactionModalForm
        item={selectedItem}
        isOpen={isOpen}
        onDismiss={onDialogDismissed}
      />
    </>
  );
};
