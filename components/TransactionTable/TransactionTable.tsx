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
import { TableSkeleton } from "./TableSkeleton";
import { useMutateTransaction } from "@/hooks/useMutateTransaction";
import { DeleteTableItemButton } from "../DeleteTableItemButton";
import { useRenderCell } from "./Columns";

interface TranactionTableProps {
  isLoading: boolean;
  topContent?: React.ReactNode;
  transactions: Transaction[] | undefined;
}

export const TransactionTable: React.FC<TranactionTableProps> = ({
  isLoading,
  topContent,
  transactions,
}) => {
  const { isMutating, deleteTransaction } = useMutateTransaction();
  const { columns, renderCell } = useRenderCell();

  if (isLoading || !transactions) return <TableSkeleton />;

  return (
    <>
      <Table
        isStriped
        isCompact
        aria-label="Transactions"
        topContentPlacement="outside"
        topContent={topContent}
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
          emptyContent={"No transactions to display."}
        >
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => {
                if (columnKey === "actions") {
                  return (
                    <TableCell>
                      <div className="flex flex-row justify-center">
                        <DeleteTableItemButton
                          itemId={item.id}
                          isDisabled={isMutating}
                          deleteTableItem={deleteTransaction}
                        />
                      </div>
                    </TableCell>
                  );
                }
                return renderCell(columnKey, item);
              }}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  );
};
