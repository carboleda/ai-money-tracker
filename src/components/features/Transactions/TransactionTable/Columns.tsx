import { formatCurrency } from "@/config/utils";
import { Chip, Table } from "@heroui/react";
import { TransactionTypeDecorator } from "@/components/TransactionTypeDecorator";
import { useIsMobile } from "@/hooks/useIsMobile";
import { TableColumn, RenderCellProps } from "@/interfaces/global";
import dayjs from "dayjs";
import { JSX } from "react";
import { TransactionOutput } from "@/app/api/domain/transaction/ports/outbound/filter-transactions.port";

const columnsDesktop: TableColumn[] = [
  {
    key: "description",
    className: "uppercase",
    isRowHeader: true,
  },
  {
    key: "date",
    className: "uppercase",
  },
  {
    key: "amount",
    className: "uppercase text-end",
  },
];

const columnsMobile: TableColumn[] = [
  {
    key: "transaction",
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
}: RenderCellProps<TransactionOutput>): JSX.Element => {
  switch (key) {
    case "description":
      return (
        <Table.Cell>
          <div className="flex flex-col items-start gap-1">
            <span className="font-normal">{item.description}</span>
            <div className="flex flex-row gap-1 items-center text-md">
              <span className="flex flex-row gap-1 items-center flex-wrap font-light text-default-600">
                {item.sourceAccount.name}
                {item.destinationAccount?.ref && (
                  <span className="flex gap-1 font-light whitespace-nowrap">
                    <span className="hidden lg:inline">&#10141;</span>
                    {item.destinationAccount.name}
                  </span>
                )}
              </span>
              {item.category && (
                <Chip variant="tertiary" className="rounded-sm">
                  {`${item.category.icon} ${item.category.name}`}
                </Chip>
              )}
            </div>
          </div>
        </Table.Cell>
      );
    case "date":
      return (
        <Table.Cell>
          <span className="font-normal">
            {dayjs(new Date(item.createdAt)).format("MMM D, YYYY hh:mm A")}
          </span>
        </Table.Cell>
      );
    case "amount":
      return (
        <Table.Cell className="text-end">
          <TransactionTypeDecorator type={item.type}>
            {formatCurrency(item.amount)}
          </TransactionTypeDecorator>
        </Table.Cell>
      );
    default:
      return <></>;
  }
};

const renderCellMobile = ({
  key,
  item,
}: RenderCellProps<TransactionOutput>): JSX.Element => {
  if (key !== "transaction") {
    return <></>;
  }

  return (
    <Table.Cell colSpan={3}>
      <div className="flex flex-col gap-1 py-1">
        <p className="text-xs font-normal">{item.description}</p>
        <div className="flex flex-row w-full items-center justify-between">
          <div className="flex items-center gap-1 justify-start">
            <TransactionTypeDecorator type={item.type} size="sm">
              <span className="font-light">{formatCurrency(item.amount)}</span>
            </TransactionTypeDecorator>
            {item.category && (
              <Chip variant="tertiary" size="sm" className="rounded-sm">
                {`${item.category.icon} ${item.category.name}`}
              </Chip>
            )}
          </div>
          <div className="flex flex-col items-end text-xs">
            <span className="font-semibold">{item.sourceAccount.name}</span>
            {item.destinationAccount?.ref && (
              <span className="font-light">{item.destinationAccount.name}</span>
            )}
          </div>
        </div>
      </div>
    </Table.Cell>
  );
};

export const useRenderCell = () => {
  const isMobile = useIsMobile();

  const columns = isMobile ? columnsMobile : columnsDesktop;
  const renderCell = isMobile ? renderCellMobile : renderCellDesktop;

  return { columns, renderCell };
};
