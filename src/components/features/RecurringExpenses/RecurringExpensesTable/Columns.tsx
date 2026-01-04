import { formatCurrency, formatFrequency } from "@/config/utils";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import { TableCell, TableRow } from "@heroui/table";
import { useIsMobile } from "@/hooks/useIsMobile";
import { TableColumn, RenderCellProps } from "@/interfaces/global";
import { TransactionTypeDecorator } from "@/components/TransactionTypeDecorator";
import { Frequency, RecurringExpense } from "@/interfaces/recurringExpense";
import { JSX } from "react";
import { IconEdit } from "@/components/shared/icons";
import { DeleteTableItemButton } from "@/components/DeleteTableItemButton";

const columnsDesktop: TableColumn[] = [
  {
    key: "description",
    className: "uppercase",
  },
  {
    key: "frequency",
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
    key: "expense",
    className: "uppercase",
  },
  // {
  //   key: "actions",
  //   className: "uppercase text-center",
  // },
];

const renderCellDesktop = ({
  key,
  item,
}: RenderCellProps<RecurringExpense>): JSX.Element => {
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
            disabled={item.disabled}
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
      <TableCell colSpan={colSpan} className="text-center px-3">
        <div className="py-3 my-3 font-bold text-zinc-200 bg-blue-600 rounded-md">
          {title}
        </div>
      </TableCell>
    </TableRow>
  );
};

const renderCellMobile = ({
  key,
  item,
  onEdit,
  onDelete,
  isDeleteDisabled,
}: RenderCellProps<RecurringExpense>): JSX.Element => {
  switch (key) {
    case "expense":
      return (
        <TableCell>
          <div className="flex flex-col items-start gap-2">
            <p className="text-xs font-normal">{item.description}</p>
            <div className="flex flex-row w-full items-center justify-between">
              <span>
                <TransactionTypeDecorator
                  color={
                    item.frequency === Frequency.Monthly
                      ? "primary"
                      : "secondary"
                  }
                  size="sm"
                  disabled={item.disabled}
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
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-light">
                {formatFrequency(item.frequency, item.dueDate)}
              </span>
              <div className="flex flex-row items-center">
                <Button
                  isIconOnly
                  color="warning"
                  variant="light"
                  className="self-center"
                  size="sm"
                  aria-label="Edit"
                  onPress={() => onEdit?.(item)}
                >
                  <IconEdit />
                </Button>
                <DeleteTableItemButton
                  size="sm"
                  itemId={item.id}
                  isDisabled={isDeleteDisabled}
                  deleteTableItem={onDelete!}
                />
              </div>
            </div>
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
      <TableCell colSpan={colSpan} className="text-center px-3">
        <div className="py-3 my-3 mx-3 font-bold text-zinc-200 bg-blue-600 rounded-md">
          {title}
        </div>
      </TableCell>
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
  const rowHeight = isMobile ? 110 : 50;

  return { columns, renderCell, rowHeight, renderSeparator };
};
