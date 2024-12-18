"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/table";
import {
  Frequency,
  FrequencyGroup,
  RecurringExpense,
} from "@/interfaces/recurringExpense";
import { TableSkeleton } from "./TableSkeleton";
import { Button } from "@nextui-org/button";
import { IconEdit } from "@/components/shared/icons";
import { HiOutlineSearch } from "react-icons/hi";
import { RecurringExpenseModalForm } from "../RecurringExpenseModalForm/RecurringExpenseModalForm";
import { useMemo, useState } from "react";
import { DeleteTableItemButton } from "@/components/DeleteTableItemButton";
import { useMutateRecurringExpenses } from "@/hooks/useMutateRecurrentExpense";
import { useRenderCell } from "./Columns";
import { HiOutlinePlusCircle } from "react-icons/hi";
import { Input } from "@nextui-org/input";

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
  const [selectedItem, setSelectedItem] = useState<RecurringExpense>();
  const [isOpen, setOpen] = useState(false);
  const [filterValue, setFilterValue] = useState("");
  const { isMutating, deleteConfig } = useMutateRecurringExpenses();
  const { columns, renderCell, renderSeparator } = useRenderCell();

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

  const onSearchChange = (value?: string) => {
    setFilterValue(value || "");
  };

  const onClear = () => {
    setFilterValue("");
  };

  const renderTopContent = () => (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between gap-3 items-center w-full">
        <Input
          isClearable
          className="w-full sm:max-w-[44%]"
          placeholder="Search by description..."
          startContent={<HiOutlineSearch />}
          value={filterValue}
          onClear={() => onClear()}
          onValueChange={onSearchChange}
        />
        <div className="flex w-fit justify-end">
          <Button
            color="primary"
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
        aria-label="Recurrent Expenses"
        disabledKeys={[FrequencyGroup.Others]}
        topContentPlacement="outside"
        topContent={renderTopContent()}
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn key={column.key} className={`${column.className}`}>
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          items={transactions}
          emptyContent={"No recurrent expenses to display."}
        >
          {(item) => {
            if (item.id === FrequencyGroup.Others) {
              return renderSeparator(
                item.id,
                columns.length,
                "BIANNUAL AND YEARLY EXPENSES"
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
