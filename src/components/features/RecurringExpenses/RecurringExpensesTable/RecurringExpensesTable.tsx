"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/table";
import {
  Frequency,
  FrequencyGroup,
} from "@/app/api/domain/recurring-expense/model/recurring-expense.model";
import type { RecurringExpenseOutput } from "@/app/api/domain/recurring-expense/ports/outbound/get-recurring-expenses.port";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { Button } from "@heroui/button";
import { IconEdit } from "@/components/shared/icons";
import { RecurringExpenseModalForm } from "../RecurringExpenseModalForm/RecurringExpenseModalForm";
import { useMemo, useState } from "react";
import { DeleteTableItemButton } from "@/components/DeleteTableItemButton";
import { useMutateRecurringExpenses } from "@/hooks/useMutateRecurringExpense";
import { useRenderCell } from "./Columns";
import { HiOutlinePlusCircle } from "react-icons/hi";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";
import { useTableHeight } from "@/hooks/useTableHeight";
import { SearchToolbar } from "@/components/features/Transactions/SearchToolbar";

interface RecurringExpensesTableProps {
  isLoading: boolean;
  recurringExpenses?: RecurringExpenseOutput[];
}

const groupByFrequency = (recurringExpenses: RecurringExpenseOutput[]) => {
  const { monthly = [], others = [] } = Object.groupBy(
    recurringExpenses,
    (expense) =>
      expense.frequency == Frequency.MONTHLY
        ? FrequencyGroup.MONTHLY
        : FrequencyGroup.OTHERS
  );

  const separator = {
    id: FrequencyGroup.OTHERS,
  } as unknown as RecurringExpenseOutput;

  return [
    ...monthly,
    ...(monthly.length && others.length ? [separator] : []),
    ...others,
  ];
};

export const RecurringExpensesTable: React.FC<RecurringExpensesTableProps> = ({
  isLoading,
  recurringExpenses,
}) => {
  const { t } = useTranslation(LocaleNamespace.RecurringExpenses);
  const [selectedItem, setSelectedItem] = useState<RecurringExpenseOutput>();
  const [isOpen, setIsOpen] = useState(false);
  const [filterValue, setFilterValue] = useState("");
  const { isMutating, deleteConfig } = useMutateRecurringExpenses();
  const { columns, renderCell, rowHeight, renderSeparator } = useRenderCell();
  const { maxTableHeight } = useTableHeight();

  const transactions = useMemo(() => {
    if (!recurringExpenses) return recurringExpenses;

    let filteredRecurringExpenses = [...recurringExpenses];

    if (filterValue) {
      filteredRecurringExpenses = filteredRecurringExpenses.filter(
        (expense) =>
          expense.description
            .toLowerCase()
            .includes(filterValue.toLowerCase()) ||
          expense.category.name.toLowerCase().includes(filterValue.toLowerCase())
      );
    }

    return groupByFrequency(filteredRecurringExpenses);
  }, [recurringExpenses, filterValue]);

  const onDialogDismissed = () => {
    setSelectedItem(undefined);
    setIsOpen(false);
  };

  const onEdit = (item: RecurringExpenseOutput) => {
    setSelectedItem(item);
    setIsOpen(true);
  };

  const renderTopContent = () => (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between gap-3 items-center w-full">
        <SearchToolbar
          filterValue={filterValue}
          onSearchChange={setFilterValue}
        />
        <div className="flex w-fit justify-end">
          <Button
            color="success"
            radius="sm"
            variant="solid"
            isIconOnly
            onPress={() => setIsOpen(true)}
          >
            <HiOutlinePlusCircle className="text-lg" />
          </Button>
        </div>
      </div>
    </div>
  );

  if (isLoading || !recurringExpenses) return <TableSkeleton />;

  return (
    <>
      <Table
        isStriped
        isCompact
        isVirtualized
        maxTableHeight={maxTableHeight}
        rowHeight={rowHeight}
        aria-label={t("recurringExpenses")}
        disabledKeys={[FrequencyGroup.OTHERS]}
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
        <TableBody items={transactions} emptyContent={t("emptyContent")}>
          {(item) => {
            if (item.id === FrequencyGroup.OTHERS) {
              return renderSeparator(
                item.id,
                columns.length,
                t("separatorTitle")
              );
            }

            return (
              <TableRow key={item.id}>
                {(columnKey) => {
                  if (columnKey === "actions") {
                    return (
                      <TableCell>
                        <div className="text-center flex flex-row justify-center">
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
                            deleteTableItem={deleteConfig}
                          />
                        </div>
                      </TableCell>
                    );
                  }

                  return renderCell({
                    key: columnKey,
                    item,
                    onEdit,
                    onDelete: deleteConfig,
                  });
                }}
              </TableRow>
            );
          }}
        </TableBody>
      </Table>
      <RecurringExpenseModalForm
        item={selectedItem}
        isOpen={isOpen}
        onDismiss={onDialogDismissed}
      />
    </>
  );
};
