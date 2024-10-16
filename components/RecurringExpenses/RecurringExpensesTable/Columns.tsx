import {
  formatCurrency,
  formatFrequency,
  formatTimeDate,
} from "@/config/utils";
import { Chip } from "@nextui-org/chip";
import { TableCell } from "@nextui-org/table";
import { useIsMobile } from "@/hooks/useIsMobile";
import { TableColumn } from "@/interfaces/global";
import { TransactionTypeDecorator } from "@/components/TransactionTypeDecorator";
import { RecurringExpense } from "@/interfaces/recurringExpense";
import { TransactionType } from "@/interfaces/transaction";

const columnsDesktop: TableColumn[] = [
  {
    key: "description",
    label: "DESCRIPTION",
  },
  {
    key: "frequency",
    label: "FREQUENCY",
  },
  {
    key: "amount",
    label: "AMOUNT",
    className: "text-end",
  },
  {
    key: "actions",
    label: "ACTIONS",
    className: "text-center",
  },
];

const columnsMobile: TableColumn[] = [
  {
    key: "expense",
    label: "EXPENSE",
  },
  {
    key: "actions",
    label: "ACTIONS",
    className: "text-center",
  },
];

const renderCellDesktop = (key: any, item: RecurringExpense): JSX.Element => {
  switch (key) {
    case "description":
      return (
        <TableCell>
          <div className="flex flex-row items-center gap-2">
            <span>{item.description}</span>
            {item.category && (
              <Chip radius="sm" variant="flat" className="ml-2">
                {item.category}
              </Chip>
            )}
          </div>
        </TableCell>
      );
    case "frequency":
      return (
        <TableCell>{formatFrequency(item.frequency, item.dueDate)}</TableCell>
      );
    case "amount":
      return (
        <TableCell className="text-end">
          <TransactionTypeDecorator type={TransactionType.TRANSFER}>
            {formatCurrency(item.amount)}
          </TransactionTypeDecorator>
        </TableCell>
      );
    default:
      return <></>;
  }
};

const renderCellMobile = (key: any, item: RecurringExpense): JSX.Element => {
  switch (key) {
    case "expense":
      return (
        <TableCell>
          <div className="flex flex-col items-start gap-2">
            <span>{item.description}</span>
            <span className="text-gray-400">
              {formatFrequency(item.frequency, item.dueDate)}
            </span>
            <span>
              <TransactionTypeDecorator
                type={TransactionType.TRANSFER}
                size="sm"
              >
                {formatCurrency(item.amount)}
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
