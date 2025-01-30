import { formatCurrency, formatTimeDate } from "@/config/utils";
import { Transaction } from "@/interfaces/transaction";
import { Chip } from "@nextui-org/chip";
import { TableCell } from "@nextui-org/table";
import { TransactionTypeDecorator } from "@/components/TransactionTypeDecorator";
import { useIsMobile } from "@/hooks/useIsMobile";
import { TableColumn } from "@/interfaces/global";

const columnsDesktop: TableColumn[] = [
  {
    key: "description",
    className: "uppercase",
  },
  {
    key: "date",
    className: "uppercase",
  },
  {
    key: "amount",
    className: "uppercase text-end",
  },
  {
    key: "actions",
    className: "uppercase text-center",
  },
];

const columnsMobile: TableColumn[] = [
  {
    key: "transaction",
    className: "uppercase",
  },
  {
    key: "actions",
    className: "uppercase text-center",
  },
];

const renderCellDesktop = (key: any, item: Transaction): JSX.Element => {
  switch (key) {
    case "description":
      return (
        <TableCell>
          <div className="flex flex-col items-start gap-2">
            <div>
              {item.sourceAccount}
              <span>
                {item.destinationAccount && (
                  <span> &#10141; {item.destinationAccount}</span>
                )}
                {item.category && (
                  <Chip radius="sm" variant="flat" className="ml-2">
                    {item.category}
                  </Chip>
                )}
              </span>
            </div>
            <span className="text-gray-400">{item.description}</span>
          </div>
        </TableCell>
      );
    case "date":
      return <TableCell>{formatTimeDate(new Date(item.createdAt))}</TableCell>;
    case "amount":
      return (
        <TableCell className="text-end">
          <TransactionTypeDecorator type={item.type}>
            {formatCurrency(item.amount)}
          </TransactionTypeDecorator>
        </TableCell>
      );
    default:
      return <></>;
  }
};

const renderCellMobile = (key: any, item: Transaction): JSX.Element => {
  switch (key) {
    case "transaction":
      return (
        <TableCell>
          <div className="flex flex-col items-start gap-2">
            <div>
              <span>{item.sourceAccount}</span>
              {item.destinationAccount && (
                <span> &#10141; {item.destinationAccount}</span>
              )}
            </div>
            <span className="text-gray-400">{item.description}</span>
            <span className="text-gray-400">
              {formatTimeDate(new Date(item.createdAt))}
            </span>
            <span className="text-end">
              <TransactionTypeDecorator type={item.type} size="sm">
                <span className="text-sm">{formatCurrency(item.amount)}</span>
              </TransactionTypeDecorator>
              {item.category && (
                <Chip radius="sm" variant="flat" size="sm" className="ml-2">
                  {item.category}
                </Chip>
              )}
            </span>
          </div>
        </TableCell>
      );
    default:
      return <></>;
  }
};

export const useRenderCell = () => {
  const isMobile = useIsMobile();

  const columns = isMobile ? columnsMobile : columnsDesktop;
  const renderCell = isMobile ? renderCellMobile : renderCellDesktop;

  return { columns, renderCell };
};
