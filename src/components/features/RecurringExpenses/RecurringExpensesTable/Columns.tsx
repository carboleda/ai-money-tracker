import { formatCurrency, formatFrequency } from "@/config/utils";
import { Button, Chip, Table } from "@heroui/react";
import { useIsMobile } from "@/hooks/useIsMobile";
import { TableColumn, RenderCellProps } from "@/interfaces/global";
import { TransactionTypeDecorator } from "@/components/TransactionTypeDecorator";
import { Frequency } from "@/app/api/domain/recurring-expense/model/recurring-expense.model";
import type { RecurringExpenseOutput } from "@/app/api/domain/recurring-expense/ports/outbound/get-recurring-expenses.port";
import { JSX } from "react";
import { IconEdit } from "@/components/shared/icons";
import { DeleteTableItemButton } from "@/components/DeleteTableItemButton";

const columnsDesktop: TableColumn[] = [
  {
    key: "description",
    className: "uppercase",
    isRowHeader: true,
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
    isRowHeader: true,
  },
  // {
  //   key: "actions",
  //   className: "uppercase text-center",
  // },
];

const renderCellDesktop = ({
  key,
  item,
}: RenderCellProps<RecurringExpenseOutput>): JSX.Element => {
  switch (key) {
    case "description":
      return (
        <Table.Cell>
          <div className="flex flex-row items-center gap-2">
            <span>{item.description}</span>
            {item.category && (
              <Chip variant="tertiary" size="sm" className="rounded-sm">
                {`${item.category.icon} ${item.category.name}`}
              </Chip>
            )}
          </div>
        </Table.Cell>
      );
    case "frequency":
      return (
        <Table.Cell>{formatFrequency(item.frequency, item.dueDate)}</Table.Cell>
      );
    case "amount":
      return (
        <Table.Cell className="text-end">
          <TransactionTypeDecorator
            color={
              item.frequency === Frequency.MONTHLY ? "accent" : "default"
            }
            disabled={item.disabled}
          >
            {formatCurrency(item.amount)}
          </TransactionTypeDecorator>
        </Table.Cell>
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
    <Table.Row key={id} id={id}>
      <Table.Cell colSpan={colSpan} className="text-center px-3">
        <div className="py-3 my-3 font-bold text-zinc-200 bg-blue-600 rounded-md">
          {title}
        </div>
      </Table.Cell>
    </Table.Row>
  );
};

const renderCellMobile = ({
  key,
  item,
  onEdit,
  onDelete,
  isDeleteDisabled,
}: RenderCellProps<RecurringExpenseOutput>): JSX.Element => {
  switch (key) {
    case "expense":
      return (
        <Table.Cell>
          <div className="flex flex-col items-start gap-2">
            <p className="text-xs font-normal">{item.description}</p>
            <div className="flex flex-row w-full items-center justify-between">
              <span>
                <TransactionTypeDecorator
                  color={
                    item.frequency === Frequency.MONTHLY
                      ? "accent"
                      : "default"
                  }
                  size="sm"
                  disabled={item.disabled}
                >
                  {formatCurrency(item.amount)}
                </TransactionTypeDecorator>
                {item.category && (
                  <Chip
                    variant="tertiary"
                    size="sm"
                    className="ml-2 rounded-sm"
                  >
                    {`${item.category.icon} ${item.category.name}`}
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
                  variant="tertiary"
                  className="self-center text-warning"
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
        </Table.Cell>
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
    <Table.Row key={id} id={id}>
      <Table.Cell colSpan={colSpan} className="text-center px-3">
        <div className="py-3 my-3 mx-3 font-bold text-zinc-200 bg-blue-600 rounded-md">
          {title}
        </div>
      </Table.Cell>
    </Table.Row>
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
