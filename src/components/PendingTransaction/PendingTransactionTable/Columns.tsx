import { formatCurrency, formatDate } from "@/config/utils";
import { Transaction, TransactionType } from "@/interfaces/transaction";
import { Chip } from "@heroui/chip";
import { TableCell } from "@heroui/table";
import { useIsMobile } from "@/hooks/useIsMobile";
import { TableColumn } from "@/interfaces/global";
import { TransactionTypeDecorator } from "@/components/TransactionTypeDecorator";
import Link from "next/link";
import { IconLink } from "@/components/shared/icons";
import { NotePopover } from "@/components/NotePopover";
import { DueDateIndicator } from "@/components/shared/DueDateIndicator";
import { JSX } from "react";

const columnsDesktop: TableColumn[] = [
  {
    key: "date",
    className: "uppercase",
  },
  {
    key: "description",
    className: "uppercase text-start",
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
    className: "text-center",
  },
];

const renderCellDesktop = (key: any, item: Transaction): JSX.Element => {
  switch (key) {
    case "description":
      return (
        <TableCell>
          <div className="flex flex-row items-start gap-2">
            <span className="text-gray-400">
              {item.category && (
                <Chip radius="sm" variant="flat" size="sm">
                  {item.category}
                </Chip>
              )}
            </span>

            <span className="text-gray-400">{item.description}</span>
            {item.notes && <NotePopover content={item.notes} />}
          </div>
        </TableCell>
      );
    case "date":
      return (
        <TableCell>
          <div className="flex items-center gap-0">
            <DueDateIndicator dueDate={item.createdAt} />
            {formatDate(new Date(item.createdAt))}
          </div>
        </TableCell>
      );
    case "amount":
      return (
        <TableCell>
          <div className="flex flex-row items-center gap-2 justify-end">
            {item.paymentLink && (
              <Link href={item.paymentLink} target="_blank">
                <IconLink />
              </Link>
            )}
            <TransactionTypeDecorator type={TransactionType.TRANSFER}>
              {formatCurrency(item.amount)}
            </TransactionTypeDecorator>
          </div>
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
            <div className="flex flex-row items-center gap-2">
              <div className="flex items-center gap-0">
                <DueDateIndicator dueDate={item.createdAt} />
                <span>{item.description}</span>
              </div>
              {item.notes && <NotePopover content={item.notes} />}
            </div>
            <div className="flex flex-row items-center gap-2">
              <span className="text-gray-400">
                {formatDate(new Date(item.createdAt))}
              </span>
              {item.paymentLink && (
                <Link href={item.paymentLink} target="_blank">
                  <IconLink />
                </Link>
              )}
            </div>
            <span className="text-end">
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
  const rowHeight = isMobile ? 110 : 50;

  return { columns, renderCell, rowHeight };
};
