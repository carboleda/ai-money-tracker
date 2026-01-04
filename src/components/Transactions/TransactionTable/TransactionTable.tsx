"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/table";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { useMutateTransaction } from "@/hooks/useMutateTransaction";
import { DeleteTableItemButton } from "@/components/DeleteTableItemButton";
import { useRenderCell } from "./Columns";
import { Button } from "@heroui/button";
import { IconEdit } from "@/components/shared/icons";
import { useState } from "react";
import { UpdateTransactionModalForm } from "@/components/Transactions/UpdateTransactionModalForm";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";
import { useTableHeight } from "@/hooks/useTableHeight";
import { TransactionOutput } from "@/app/api/domain/transaction/ports/outbound/filter-transactions.port";

interface TranactionTableProps {
  isLoading: boolean;
  topContent?: React.ReactNode;
  transactions?: TransactionOutput[];
}

export const TransactionTable: React.FC<TranactionTableProps> = ({
  isLoading,
  topContent,
  transactions,
}) => {
  const { t } = useTranslation(LocaleNamespace.Transactions);
  const [selectedItem, setSelectedItem] = useState<TransactionOutput>();
  const [isOpen, setIsOpen] = useState(false);
  const { isMutating, deleteTransaction } = useMutateTransaction();
  const { columns, renderCell, rowHeight } = useRenderCell();
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
      <Table
        isStriped
        isCompact
        isVirtualized
        maxTableHeight={maxTableHeight}
        rowHeight={rowHeight}
        aria-label={t("subtitle")}
        topContentPlacement="outside"
        topContent={topContent}
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn key={column.key} className={`${column.className}`}>
              {t(column.key)}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody items={transactions} emptyContent={t("emptyContent")}>
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => {
                if (columnKey === "actions") {
                  return (
                    <TableCell>
                      <div className="flex flex-col items-center md:flex-row md:justify-center">
                        <Button
                          isIconOnly
                          color="warning"
                          variant="light"
                          className="self-center"
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
                    </TableCell>
                  );
                }

                return renderCell({
                  key: columnKey,
                  item,
                  onEdit,
                  onDelete: deleteTransaction,
                });
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
