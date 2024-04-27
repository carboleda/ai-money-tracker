"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/table";
import { Transaction } from "@/interfaces/transaction";
import { TransactionTypeDecorator } from "../TransactionTypeDecorator";
import { TableSkeleton } from "./TableSkeleton";
import { Button } from "@nextui-org/button";
import { IconDelete } from "../shared/icons";
import { useMutateTransaction } from "@/hooks/useMutateTransaction";

const formater = new Intl.NumberFormat();

interface TranactionTableProps {
  isLoading: boolean;
  transactions: Transaction[] | undefined;
}

export const TransactionTable: React.FC<TranactionTableProps> = ({
  isLoading,
  transactions,
}) => {
  const { isMutating, deleteTransaction } = useMutateTransaction();

  if (isLoading || !transactions) return <TableSkeleton />;

  return (
    <>
      <Table isStriped aria-label="Transactions">
        <TableHeader>
          <TableColumn>DESCRIPTION</TableColumn>
          <TableColumn>AMOUNT</TableColumn>
          <TableColumn>ACTIONS</TableColumn>
        </TableHeader>
        <TableBody
          items={transactions}
          emptyContent={"No transactions to display."}
        >
          {(item) => (
            <TableRow key={item.id}>
              <TableCell className="flex flex-col items-start gap-2">
                <div>
                  <span>{item.sourceAccount}</span>
                  {item.destinationAccount && (
                    <span> &#10141; {item.destinationAccount}</span>
                  )}
                </div>
                <span className="text-gray-400">
                  {item.category} ({item.description})
                </span>
              </TableCell>
              <TableCell>
                <TransactionTypeDecorator type={item.type}>
                  {formater.format(item.amount)}
                </TransactionTypeDecorator>
              </TableCell>
              <TableCell>
                <Button
                  isIconOnly
                  disabled={isMutating}
                  color="danger"
                  variant="light"
                  aria-label="Remove"
                  onClick={() => deleteTransaction(item.id)}
                >
                  <IconDelete />
                </Button>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  );
};
