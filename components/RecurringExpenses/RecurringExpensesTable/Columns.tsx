import { formatCurrency, formatFrequency } from "@/config/utils";
import { Chip } from "@nextui-org/chip";
import { TableCell, TableRow } from "@nextui-org/table";
import { useIsMobile } from "@/hooks/useIsMobile";
import { TableColumn } from "@/interfaces/global";
import { TransactionTypeDecorator } from "@/components/TransactionTypeDecorator";
import { Frequency, RecurringExpense } from "@/interfaces/recurringExpense";

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
          <TransactionTypeDecorator
            color={
              item.frequency === Frequency.Monthly ? "primary" : "secondary"
            }
          >
            {formatCurrency(item.amount)}
          </TransactionTypeDecorator>
        </TableCell>
      );
    default:
      return <></>;
  }
};

const renderSeparatorDesktop = (
  id: string,
  colSpan: number,
  title: string
): JSX.Element => {
  return (
    <TableRow key={id}>
      <TableCell colSpan={colSpan} className="text-center px-0">
        <div className="py-3 my-3 font-bold text-zinc-200 bg-blue-600 rounded-md">
          {title}
        </div>
      </TableCell>
      <TableCell className="hidden">&nbsp;</TableCell>
      <TableCell className="hidden">&nbsp;</TableCell>
      <TableCell className="hidden">&nbsp;</TableCell>
    </TableRow>
  );
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
                color={
                  item.frequency === Frequency.Monthly ? "primary" : "secondary"
                }
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

const renderSeparatorMobile = (
  id: string,
  colSpan: number,
  title: string
): JSX.Element => {
  return (
    <TableRow key={id}>
      <TableCell colSpan={colSpan} className="text-center px-0">
        <div className="py-3 my-3 font-bold text-zinc-200 bg-blue-600 rounded-md">
          {title}
        </div>
      </TableCell>
      <TableCell className="hidden">&nbsp;</TableCell>
    </TableRow>
  );
};

export const useRenderCell = () => {
  const isMobile = useIsMobile();

  const columns = isMobile ? columnsMobile : columnsDesktop;
  const renderCell = isMobile ? renderCellMobile : renderCellDesktop;
  const renderSeparator = isMobile
    ? renderSeparatorMobile
    : renderSeparatorDesktop;

  return { columns, renderCell, renderSeparator };
};
