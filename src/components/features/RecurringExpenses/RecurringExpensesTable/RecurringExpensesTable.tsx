"use client";

import { Table } from "@heroui/react";
import {
  Frequency,
  FrequencyGroup,
} from "@/app/api/domain/recurring-expense/model/recurring-expense.model";
import type { RecurringExpenseOutput } from "@/app/api/domain/recurring-expense/ports/outbound/get-recurring-expenses.port";
import { TableSkeleton } from "@/components/shared/Table/TableSkeleton";
import { RecurringExpenseModalForm } from "../RecurringExpenseModalForm/RecurringExpenseModalForm";
import { useMemo, useState } from "react";
import { useMutateRecurringExpenses } from "@/hooks/useMutateRecurringExpense";
import { useRenderCell } from "./Columns";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";
import { SearchToolbar } from "@/components/features/Transactions/SearchToolbar";
import { useDeleteTableItem } from "@/hooks/useDeleteTableItem";
import { TableToolbar } from "@/components/shared/Table/TableToolbar";
import { useTableSelection } from "@/hooks/useTableSelection";
import { TableContainer } from "@/components/shared/Table/TableContainer";

interface RecurringExpensesTableProps {
  isLoading: boolean;
  recurringExpenses?: RecurringExpenseOutput[];
}

const SEPARATORS = new Set([FrequencyGroup.OTHERS]);

const groupByFrequency = (recurringExpenses: RecurringExpenseOutput[]) => {
  const { monthly = [], others = [] } = Object.groupBy(
    recurringExpenses,
    (expense) =>
      expense.frequency == Frequency.MONTHLY
        ? FrequencyGroup.MONTHLY
        : FrequencyGroup.OTHERS,
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
  const [isOpen, setIsOpen] = useState(false);
  const [filterValue, setFilterValue] = useState("");
  const { isMutating, deleteConfig } = useMutateRecurringExpenses();
  const { columns, renderCell, renderSeparator } = useRenderCell();
  const { onDelete } = useDeleteTableItem({ onConfirmDelete: deleteConfig });

  const transactions = useMemo(() => {
    if (!recurringExpenses) return recurringExpenses;

    let filteredRecurringExpenses = [...recurringExpenses];

    if (filterValue) {
      filteredRecurringExpenses = filteredRecurringExpenses.filter(
        (expense) =>
          expense.description
            .toLowerCase()
            .includes(filterValue.toLowerCase()) ||
          expense.category.name
            .toLowerCase()
            .includes(filterValue.toLowerCase()),
      );
    }

    return groupByFrequency(filteredRecurringExpenses);
  }, [recurringExpenses, filterValue]);

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

  const onEdit = (item: RecurringExpenseOutput) => {
    setSelectedItem(item);
    setIsOpen(true);
  };

  const renderTopContent = () => (
    <div className="flex w-full flex-col gap-4">
      <div className="flex justify-between gap-3 items-center w-full">
        <SearchToolbar
          filterValue={filterValue}
          onSearchChange={setFilterValue}
        />
      </div>
    </div>
  );

  if (isLoading || !recurringExpenses) return <TableSkeleton />;

  return (
    <>
      {renderTopContent()}
      <Table>
        <TableToolbar
          selectedItem={selectedItem}
          isMutating={isMutating}
          rowCount={recurringExpenses?.length}
          t={t}
        >
          <TableToolbar.NewAction
            noItemRequired
            noSeparator
            onPress={() => setIsOpen(true)}
          />
          <TableToolbar.EditAction onPress={onEdit} />
          <TableToolbar.DeleteAction
            onPress={(item: RecurringExpenseOutput) =>
              onDelete(item.id, item.description)
            }
          />
        </TableToolbar>
        <TableContainer
          t={t}
          ariaLabelKey="recurringExpenses"
          disabledKeys={SEPARATORS}
          separators={SEPARATORS}
          renderCell={renderCell}
          renderSeparator={renderSeparator}
          columns={columns}
          items={transactions}
          onSelectionChange={onSelectionChange}
          selectedKeys={selectedKeys}
        />
      </Table>
      <RecurringExpenseModalForm
        item={selectedItem}
        isOpen={isOpen}
        onDismiss={onDialogDismissed}
      />
    </>
  );
};
