import { formatCurrency, formatDate } from "@/config/utils";
import { Chip, Table } from "@heroui/react";
import { useIsMobile } from "@/hooks/useIsMobile";
import { TableColumn, RenderCellProps } from "@/interfaces/global";
import { TransactionTypeDecorator } from "@/components/TransactionTypeDecorator";
import Link from "next/link";
import { NotePopover } from "@/components/NotePopover";
import { DueDateIndicator } from "@/components/shared/DueDateIndicator";
import { JSX } from "react";
import { GoLinkExternal } from "react-icons/go";
import { RiExternalLinkLine } from "react-icons/ri";
import { TransactionOutput } from "@/app/api/domain/transaction/ports/outbound/filter-transactions.port";
import { TransactionType } from "@/app/api/domain/transaction/model/transaction.model";

const columnsDesktop: TableColumn[] = [
  {
    key: "date",
    className: "uppercase",
  },
  {
    key: "description",
    className: "uppercase text-start",
    isRowHeader: true,
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
          <div className="flex flex-row items-start gap-2">
            <span className="text-gray-400">
              {item.category && (
                <Chip variant="tertiary" size="sm" className="rounded-sm">
                  {`${item.category.icon} ${item.category.name}`}
                </Chip>
              )}
            </span>

            <span className="text-gray-400">{item.description}</span>
            {item.notes && <NotePopover content={item.notes} />}
          </div>
        </Table.Cell>
      );
    case "date":
      return (
        <Table.Cell>
          <div className="flex items-center gap-0">
            <DueDateIndicator dueDate={item.createdAt} />
            {formatDate(new Date(item.createdAt))}
          </div>
        </Table.Cell>
      );
    case "amount":
      return (
        <Table.Cell>
          <div className="flex flex-row items-center gap-2 justify-end">
            {item.paymentLink && (
              <Link href={item.paymentLink} target="_blank">
                <GoLinkExternal className="text-xl" />
              </Link>
            )}
            <TransactionTypeDecorator type={TransactionType.TRANSFER}>
              {formatCurrency(item.amount)}
            </TransactionTypeDecorator>
          </div>
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
  if (key !== "transaction") return <></>;

  return (
    <Table.Cell colSpan={3}>
      <div className="flex flex-col gap-1">
        <div className="flex flex-row items-center justify-between gap-1">
          <div className="flex items-center">
            <DueDateIndicator dueDate={item.createdAt} />
            <p className="text-xs font-normal">{item.description}</p>
          </div>
          <div className="flex flex-row gap-2">
            {item.notes && <NotePopover content={item.notes} />}
            {item.paymentLink && (
              <Link href={item.paymentLink} target="_blank">
                <RiExternalLinkLine className="text-xl" />
              </Link>
            )}
          </div>
        </div>
        <div className="flex flex-row w-full items-center justify-between">
          <span className="text-end">
            <TransactionTypeDecorator
              type={TransactionType.TRANSFER}
              size="sm"
            >
              {formatCurrency(item.amount)}
            </TransactionTypeDecorator>
            {item.category && (
              <Chip variant="tertiary" size="sm" className="ml-2 rounded-sm">
                {`${item.category.icon} ${item.category.name}`}
              </Chip>
            )}
          </span>
        </div>
        <div className="flex items-center justify-between w-full">
          <span className="text-xs font-light">
            {formatDate(new Date(item.createdAt))}
          </span>
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
