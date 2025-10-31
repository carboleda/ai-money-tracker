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
  RecurringExpense,
} from "@/interfaces/recurringExpense";
import { TableSkeleton } from "./TableSkeleton";
import { Button } from "@heroui/button";
import { IconEdit } from "@/components/shared/icons";
import { RecurringExpenseModalForm } from "../RecurringExpenseModalForm/RecurringExpenseModalForm";
import { useMemo, useState } from "react";
import { DeleteTableItemButton } from "@/components/DeleteTableItemButton";
import { useMutateRecurringExpenses } from "@/hooks/useMutateRecurrentExpense";
import { useRenderCell } from "./Columns";
import { HiOutlinePlusCircle } from "react-icons/hi";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";
import { useTableHeight } from "@/hooks/useTableHeight";
import { SearchToolbar } from "@/components/Transactions/SearchToolbar";

interface RecurringExpensesTableProps {
  isLoading: boolean;
  recurringExpenses?: RecurringExpense[];
}

const groupByFrequency = (recurringExpenses: RecurringExpense[]) => {
  const { monthly = [], others = [] } = Object.groupBy(
    recurringExpenses,
    (expense) =>
      expense.frequency == Frequency.Monthly
        ? FrequencyGroup.Monthly
        : FrequencyGroup.Others
  );

  const separator = {
    id: FrequencyGroup.Others,
  } as unknown as RecurringExpense;

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
  const { t } = useTranslation(LocaleNamespace.RecurrentExpenses);
  const [selectedItem, setSelectedItem] = useState<RecurringExpense>();
  const [isOpen, setOpen] = useState(false);
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
          expense.category.toLowerCase().includes(filterValue.toLowerCase())
      );
    }

    return groupByFrequency(filteredRecurringExpenses);
  }, [recurringExpenses, filterValue]);

  const onDialogDismissed = () => {
    setSelectedItem(undefined);
    setOpen(false);
  };

  const onEdit = (item: RecurringExpense) => {
    setSelectedItem(item);
    setOpen(true);
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
            onPress={() => setOpen(true)}
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
        aria-label={t("recurrentExpenses")}
        disabledKeys={[FrequencyGroup.Others]}
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
            if (item.id === FrequencyGroup.Others) {
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

                  return renderCell(columnKey, item);
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
