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
import { useMutateTransaction } from "@/hooks/useMutateTransaction";
import { DeleteTransactionButton } from "../DeleteTransactionButton";
import { Chip } from "@nextui-org/chip";

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
          <TableColumn className="text-end">AMOUNT</TableColumn>
          <TableColumn className="text-center">ACTIONS</TableColumn>
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
                  {item.description}{" "}
                  {item.category && (
                    <Chip radius="sm" variant="flat">
                      {item.category}
                    </Chip>
                  )}
                </span>
              </TableCell>
              <TableCell className="text-end">
                <TransactionTypeDecorator type={item.type}>
                  {formater.format(item.amount)}
                </TransactionTypeDecorator>
              </TableCell>
              <TableCell className="text-center">
                <DeleteTransactionButton
                  item={item}
                  isDisabled={isMutating}
                  deleteTransaction={deleteTransaction}
                />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  );
};
