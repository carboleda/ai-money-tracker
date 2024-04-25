import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  getKeyValue,
} from "@nextui-org/table";
import useSWR from "swr";
import { ApiResponse } from "@/interfaces/global";
import { Transaction } from "@/interfaces/transaction";

const columns = [
  {
    key: "description",
    label: "Description",
  },
  {
    key: "category",
    label: "Category",
  },
  {
    key: "type",
    label: "Type",
  },
  {
    key: "sourceAccount",
    label: "Source Account",
  },
  {
    key: "amount",
    label: "Amount",
  },
];

export const TransactionTable = () => {
  const { data: reesponse, error } = useSWR<ApiResponse<Transaction[]>, Error>(
    "/api/transactions"
  );

  if (error) return <div>Failed to load</div>;
  if (!reesponse?.data) return <div>Loading...</div>;

  const rows = reesponse.data;

  return (
    <Table aria-label="Transactions">
      <TableHeader columns={columns}>
        {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
      </TableHeader>
      <TableBody items={rows}>
        {(item) => (
          <TableRow key={item.id}>
            {(columnKey) => (
              <TableCell>{getKeyValue(item, columnKey)}</TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
