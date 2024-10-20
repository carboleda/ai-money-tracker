"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/table";
import { Frequency, RecurringExpense } from "@/interfaces/recurringExpense";
import { TableSkeleton } from "./TableSkeleton";
import { Button } from "@nextui-org/button";
import { IconEdit } from "@/components/shared/icons";
import { RecurringExpenseModalForm } from "../RecurringExpenseModalForm/RecurringExpenseModalForm";
import { useMemo, useState } from "react";
import { DeleteTableItemButton } from "@/components/DeleteTableItemButton";
import { useMutateRecurringExpenses } from "@/hooks/useMutateRecurrentExpense";
import { useRenderCell } from "./Columns";
import { HiOutlinePlusCircle } from "react-icons/hi";

interface RecurringExpensesTableProps {
  isLoading: boolean;
  recurringExpenses: RecurringExpense[] | undefined;
}

export const RecurringExpensesTable: React.FC<RecurringExpensesTableProps> = ({
  isLoading,
  recurringExpenses,
}) => {
  const [selectedItem, setSelectedItem] = useState<RecurringExpense>();
  const [isOpen, setOpen] = useState(false);
  const { isMutating, deleteConfig } = useMutateRecurringExpenses();
  const { columns, renderCell, renderSeparator } = useRenderCell();

  const transactions = useMemo(() => {
    if (!recurringExpenses) return recurringExpenses;

    const { monthly = [], others = [] } = Object.groupBy(
      recurringExpenses,
      (expense) =>
        expense.frequency == Frequency.Monthly ? "monthly" : "others"
    );

    return [
      ...monthly,
      { id: "others" } as unknown as RecurringExpense,
      ...others,
    ];
  }, [recurringExpenses]);

  if (isLoading || !recurringExpenses) return <TableSkeleton />;

  const onDialogDismissed = () => {
    setSelectedItem(undefined);
    setOpen(false);
  };

  const onEdit = (item: RecurringExpense) => {
    setSelectedItem(item);
    setOpen(true);
  };

  return (
    <>
      <div className="flex w-full justify-end">
        <Button color="primary" onPress={() => setOpen(true)}>
          <HiOutlinePlusCircle className="text-lg" />
          New expense
        </Button>
      </div>
      <Table
        isStriped
        isCompact
        aria-label="Recurrent Expenses"
        disabledKeys={["others"]}
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
            if (item.id === "others") {
              return renderSeparator(
                item.id,
                columns.length,
                "YEARLY / BIMONTHLY EXPENSES"
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
                            onClick={() => onEdit(item)}
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
