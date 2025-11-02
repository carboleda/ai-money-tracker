import { formatCurrency, formatDate } from "@/config/utils";
import { Transaction, TransactionType } from "@/interfaces/transaction";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import { TableCell } from "@heroui/table";
import { useIsMobile } from "@/hooks/useIsMobile";
import { TableColumn, RenderCellProps } from "@/interfaces/global";
import { TransactionTypeDecorator } from "@/components/TransactionTypeDecorator";
import Link from "next/link";
import { NotePopover } from "@/components/NotePopover";
import { DueDateIndicator } from "@/components/shared/DueDateIndicator";
import { JSX } from "react";
import { DeleteTableItemButton } from "@/components/DeleteTableItemButton";
import { GoLinkExternal } from "react-icons/go";
import { RiExternalLinkLine } from "react-icons/ri";
import { FaRegCircleCheck } from "react-icons/fa6";

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
];

const renderCellDesktop = ({
  key,
  item,
}: RenderCellProps<Transaction>): JSX.Element => {
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
                <GoLinkExternal className="text-xl" />
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

const renderCellMobile = ({
  key,
  item,
  onEdit: onConfirm,
  onDelete,
  isDeleteDisabled,
}: RenderCellProps<Transaction>): JSX.Element => {
  switch (key) {
    case "transaction":
      return (
        <TableCell>
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
                  <Chip radius="sm" variant="flat" size="sm" className="ml-2">
                    {item.category}
                  </Chip>
                )}
              </span>
            </div>
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-light">
                {formatDate(new Date(item.createdAt))}
              </span>
              <div className="flex flex-row items-center">
                <Button
                  isIconOnly
                  color="success"
                  variant="light"
                  className="self-center"
                  size="sm"
                  aria-label="Edit"
                  onPress={() => onConfirm?.(item)}
                >
                  <FaRegCircleCheck className="text-xl" />
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

export const useRenderCell = () => {
  const isMobile = useIsMobile();

  const columns = isMobile ? columnsMobile : columnsDesktop;
  const renderCell = isMobile ? renderCellMobile : renderCellDesktop;
  const rowHeight = isMobile ? 90 : 50;

  return { columns, renderCell, rowHeight };
};
