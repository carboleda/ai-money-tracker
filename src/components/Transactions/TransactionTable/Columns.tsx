import { formatCurrency, formatTimeDate, getAccountName } from "@/config/utils";
import { Transaction } from "@/interfaces/transaction";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import { TableCell } from "@heroui/table";
import { TransactionTypeDecorator } from "@/components/TransactionTypeDecorator";
import { useIsMobile } from "@/hooks/useIsMobile";
import { TableColumn, RenderCellProps } from "@/interfaces/global";
import dayjs from "dayjs";
import { JSX } from "react";
import { IconEdit } from "@/components/shared/icons";
import { DeleteTableItemButton } from "@/components/DeleteTableItemButton";

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
];

const renderCellDesktop = ({
  key,
  item,
}: RenderCellProps<Transaction>): JSX.Element => {
  switch (key) {
    case "description":
      return (
        <TableCell>
          <div className="flex flex-col items-start gap-1">
            <span className="text-gray-400">{item.description}</span>
            <div>
              {getAccountName(item.sourceAccount)}
              <span>
                {item.destinationAccount && (
                  <span className="mr-2 font-light">
                    {" "}
                    &#10141; {getAccountName(item.destinationAccount)}
                  </span>
                )}
                {item.category && (
                  <Chip radius="sm" variant="flat">
                    {item.category}
                  </Chip>
                )}
              </span>
            </div>
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

const renderCellMobile = ({
  key,
  item,
  onEdit,
  onDelete,
  isDeleteDisabled,
}: RenderCellProps<Transaction>): JSX.Element => {
  switch (key) {
    case "transaction":
      return (
        <TableCell>
          <div className="flex flex-col gap-1 py-1">
            <p className="text-xs font-normal">{item.description}</p>
            <div className="flex flex-row w-full items-center justify-between">
              <div className="flex items-center gap-1 justify-start">
                <TransactionTypeDecorator type={item.type} size="sm">
                  <span className="font-light">
                    {formatCurrency(item.amount)}
                  </span>
                </TransactionTypeDecorator>
                {item.category && (
                  <Chip radius="sm" variant="flat" size="sm">
                    {item.category}
                  </Chip>
                )}
              </div>
              <div className="flex flex-col items-end text-xs">
                <span className="font-semibold">{item.sourceAccount}</span>
                {item.destinationAccount && (
                  <span className="font-light">{item.destinationAccount}</span>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-light">
                {dayjs(new Date(item.createdAt)).format("MMM D, YY h:mm A")}
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

export const useRenderCell = () => {
  const isMobile = useIsMobile();

  const columns = isMobile ? columnsMobile : columnsDesktop;
  const renderCell = isMobile ? renderCellMobile : renderCellDesktop;
  const rowHeight = isMobile ? 90 : 65;

  return { columns, renderCell, rowHeight };
};
