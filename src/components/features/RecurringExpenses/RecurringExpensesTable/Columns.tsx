import { formatCurrency, formatFrequency } from "@/config/utils";
import { Chip, Table } from "@heroui/react";
import { useIsMobile } from "@/hooks/useIsMobile";
import { TableColumn, RenderCellProps } from "@/interfaces/global";
import { TransactionTypeDecorator } from "@/components/TransactionTypeDecorator";
import { Frequency } from "@/app/api/domain/recurring-expense/model/recurring-expense.model";
import type { RecurringExpenseOutput } from "@/app/api/domain/recurring-expense/ports/outbound/get-recurring-expenses.port";
import { CustomIcon } from "@/components/shared/CustomIcon";
import { JSX } from "react";

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
];

const columnsMobile: TableColumn[] = [
  {
    key: "expense",
    className: "uppercase",
    isRowHeader: true,
  },
  {
    key: "empty1",
  },
  {
    key: "empty2",
  },
];

const renderCellDesktop = ({
  key,
  item,
}: RenderCellProps<RecurringExpenseOutput>): JSX.Element => {
  switch (key) {
    case "description":
      return (
        <Table.Cell>
          <div className="flex items-center gap-2">
            <CustomIcon icon={item.category?.icon} />
            <div className="flex flex-col items-start gap-1">
              <span>{item.description}</span>
              {item.category && (
                <Chip variant="tertiary" size="sm" className="rounded-sm p-0">
                  {item.category.name}
                </Chip>
              )}
            </div>
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
      <Table.Cell colSpan={colSpan} className="text-justify px-3">
        <div className="py-1 font-bold text-zinc-200 rounded-md">{title}</div>
      </Table.Cell>
    </Table.Row>
  );
};

const renderCellMobile = ({
  key,
  item,
}: RenderCellProps<RecurringExpenseOutput>): JSX.Element => {
  if (key !== "expense") return <></>;

  return (
    <Table.Cell colSpan={3}>
      <div className="flex flex-col gap-1.5 py-1.5 w-full">
        <p className="text-sm font-semibold truncate">{item.description}</p>
        <div className="flex items-center justify-between gap-3 w-full">
          <div className="flex items-center gap-2 min-w-0">
            <CustomIcon icon={item.category?.icon} />
            {item.category && (
              <span className="text-xs font-light text-default-500 truncate">
                {item.category.name}
              </span>
            )}
          </div>
          <div className="flex flex-col items-end shrink-0 gap-0.5">
            <TransactionTypeDecorator
              color={
                item.frequency === Frequency.MONTHLY ? "accent" : "default"
              }
              size="sm"
              disabled={item.disabled}
            >
              {formatCurrency(item.amount)}
            </TransactionTypeDecorator>
            <span className="text-xs font-light text-default-500">
              {formatFrequency(item.frequency, item.dueDate)}
            </span>
          </div>
        </div>
      </div>
    </Table.Cell>
  );
};

const renderSeparatorMobile = (
  id: string,
  colSpan: number,
  title: string
): JSX.Element => {
  return (
    <Table.Row key={id} id={id}>
      <Table.Cell colSpan={colSpan} className="text-justify px-3">
        <div className="py-1 font-bold text-zinc-200 rounded-md">{title}</div>
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
