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
import { useMeasuredTableHeight } from "@/hooks/useMeasuredTableHeight";
import { SearchToolbar } from "@/components/features/Transactions/SearchToolbar";
import { EmptyTableState } from "@/components/shared/Table/EmptyTableState";
import { useDeleteTableItem } from "@/hooks/useDeleteTableItem";
import { TableToolbar } from "@/components/shared/Table/TableToolbar";
import { useTableSelection } from "@/hooks/useTableSelection";

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
  const { maxTableHeight, containerRef } = useMeasuredTableHeight();
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
        <Table.ScrollContainer
          ref={containerRef}
          className="overflow-y-auto"
          style={{ maxHeight: maxTableHeight }}
        >
          <Table.Content
            aria-label={t("recurringExpenses")}
            selectionMode="single"
            selectedKeys={selectedKeys}
            onSelectionChange={onSelectionChange}
            disabledKeys={new Set([FrequencyGroup.OTHERS])}
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
              {(item) => {
                if (item.id === FrequencyGroup.OTHERS) {
                  return renderSeparator(
                    item.id,
                    columns.length,
                    t("separatorTitle"),
                  );
                }

                return (
                  <Table.Row key={item.id} id={item.id}>
                    <Table.Collection items={columns}>
                      {(column) => {
                        return renderCell({
                          key: column.key,
                          item,
                        });
                      }}
                    </Table.Collection>
                  </Table.Row>
                );
              }}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>
      <RecurringExpenseModalForm
        item={selectedItem}
        isOpen={isOpen}
        onDismiss={onDialogDismissed}
      />
    </>
  );
};
