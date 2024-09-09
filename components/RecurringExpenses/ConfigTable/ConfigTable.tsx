"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/table";
import { RecurringExpenseConfig } from "@/interfaces/recurringExpense";
import { TableSkeleton } from "./TableSkeleton";
import { Chip } from "@nextui-org/chip";
import { Button } from "@nextui-org/button";
import { TransactionTypeDecorator } from "@/components/TransactionTypeDecorator";
import { TransactionType } from "@/interfaces/transaction";
import { IconEdit } from "@/components/shared/icons";
import { ConfigRecurringExpenseModalForm } from "../ConfigModalForm/ConfigModalForm";
import { useState } from "react";

const formater = new Intl.NumberFormat();

interface ConfigRecurringExpensesTableProps {
  isLoading: boolean;
  recurringExpenses: RecurringExpenseConfig[] | undefined;
}

export const ConfigRecurringExpensesTable: React.FC<
  ConfigRecurringExpensesTableProps
> = ({ isLoading, recurringExpenses }) => {
  const [selectedItem, setSelectedItem] = useState<RecurringExpenseConfig>();
  const [isOpen, setOpen] = useState(false);

  if (isLoading || !recurringExpenses) return <TableSkeleton />;

  const onDialogDismissed = () => {
    setSelectedItem(undefined);
    setOpen(false);
  };

  const onEdit = (item: RecurringExpenseConfig) => {
    setSelectedItem(item);
    setOpen(true);
  };

  return (
    <>
      <div className="flex w-full justify-end">
        <Button onPress={() => setOpen(true)}>Create</Button>
      </div>
      <Table isStriped aria-label="Recurring Expenses">
        <TableHeader>
          <TableColumn>DESCRIPTION</TableColumn>
          <TableColumn>FREQUENCY</TableColumn>
          <TableColumn>DUE DATE</TableColumn>
          <TableColumn className="text-end">AMOUNT</TableColumn>
          <TableColumn className="text-center">ACTIONS</TableColumn>
        </TableHeader>
        <TableBody
          items={recurringExpenses}
          emptyContent={"No recurring expenses to display."}
        >
          {(item) => (
            <TableRow key={item.id}>
              <TableCell className="flex flex-col items-start gap-2">
                <div>
                  <span>{item.description} </span>
                  {item.category && (
                    <Chip radius="sm" variant="flat">
                      {item.category}
                    </Chip>
                  )}
                </div>
              </TableCell>
              <TableCell>{item.frequency}</TableCell>
              <TableCell>{item.dueDate}</TableCell>
              <TableCell className="text-end">
                <TransactionTypeDecorator type={TransactionType.EXPENSE}>
                  {formater.format(item.amount)}
                </TransactionTypeDecorator>
              </TableCell>
              <TableCell className="text-center">
                <Button
                  isIconOnly
                  color="primary"
                  variant="light"
                  className="self-center"
                  aria-label="Edit"
                  onClick={() => onEdit(item)}
                >
                  <IconEdit />
                </Button>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <ConfigRecurringExpenseModalForm
        item={selectedItem}
        isOpen={isOpen}
        onDismiss={onDialogDismissed}
      />
    </>
  );
};
