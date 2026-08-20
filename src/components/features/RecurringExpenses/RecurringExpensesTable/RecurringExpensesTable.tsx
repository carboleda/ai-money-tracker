"use client";

import { Button, Table } from "@heroui/react";
import {
  Frequency,
  FrequencyGroup,
} from "@/app/api/domain/recurring-expense/model/recurring-expense.model";
import type { RecurringExpenseOutput } from "@/app/api/domain/recurring-expense/ports/outbound/get-recurring-expenses.port";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
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
import { EmptyTableState } from "@/components/shared/EmptyTableState";

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
  const { columns, renderCell, renderSeparator } = useRenderCell();
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
    <div className="flex w-full flex-col gap-4">
      <div className="flex justify-between gap-3 items-center w-full">
        <SearchToolbar
          filterValue={filterValue}
          onSearchChange={setFilterValue}
        />
        <div className="flex w-fit justify-end">
          <Button
            variant="primary"
            className="bg-success text-success-foreground"
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
      {renderTopContent()}
      <Table>
        <Table.ScrollContainer
          className="overflow-y-auto"
          style={{ maxHeight: maxTableHeight }}
        >
          <Table.Content aria-label={t("recurringExpenses")}>
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
                    t("separatorTitle")
                  );
                }

                return (
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
                            </Table.Cell>
                          );
                        }

                        return renderCell({
                          key: column.key,
                          item,
                          onEdit,
                          onDelete: deleteConfig,
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
