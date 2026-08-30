import {
  formatCurrency,
  formatDate,
  getTransactionOverdueStatus,
} from "@/config/utils";
import { AvatarVariants, Chip, Table } from "@heroui/react";
import { useIsMobile } from "@/hooks/useIsMobile";
import { TableColumn, RenderCellProps } from "@/interfaces/global";
import { TransactionTypeDecorator } from "@/components/TransactionTypeDecorator";
import Link from "next/link";
import { NotePopover } from "@/components/NotePopover";
import { CustomIcon } from "@/components/shared/CustomIcon";
import { JSX } from "react";
import { GoLinkExternal } from "react-icons/go";
import { RiExternalLinkLine } from "react-icons/ri";
import { TransactionOutput } from "@/app/api/domain/transaction/ports/outbound/filter-transactions.port";
import { TransactionType } from "@/app/api/domain/transaction/model/transaction.model";
import { TransactionOverdueStatus } from "@/interfaces/transaction";

const columnsDesktop: TableColumn[] = [
  {
    key: "description",
    className: "uppercase text-start",
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

const statusDotColorMap: Record<
  TransactionOverdueStatus,
  AvatarVariants["color"]
> = {
  [TransactionOverdueStatus.OVERDUE]: "danger",
  [TransactionOverdueStatus.SOON]: "warning",
  [TransactionOverdueStatus.UPCOMING]: "accent",
};

const renderCellDesktop = ({
  key,
  item,
}: RenderCellProps<TransactionOutput>): JSX.Element => {
  const status = getTransactionOverdueStatus(item.createdAt);

  switch (key) {
    case "description":
      return (
        <Table.Cell>
          <div className="flex items-center gap-2">
            <CustomIcon
              icon={item.category?.icon}
              color={statusDotColorMap[status]}
            />
            <div className="flex flex-col items-start gap-1">
              <div className="flex flex-row items-center gap-2">
                <span className="text-gray-400">{item.description}</span>
                {item.notes && <NotePopover content={item.notes} />}
              </div>
              {item.category && (
                <Chip variant="tertiary" size="sm" className="rounded-sm p-0">
                  {item.category.name}
                </Chip>
              )}
            </div>
          </div>
        </Table.Cell>
      );
    case "date":
      return (
        <Table.Cell>
          <div className="flex items-center gap-2">
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

  const status = getTransactionOverdueStatus(item.createdAt);

  return (
    <Table.Cell colSpan={3}>
      <div className="flex flex-col gap-1.5 py-1.5 w-full">
        <div className="flex items-center justify-between gap-2 w-full">
          <div className="flex items-center gap-1 min-w-0">
            <p className="text-sm font-semibold truncate">{item.description}</p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 w-full">
          <div className="flex items-center gap-2 min-w-0">
            <CustomIcon
              icon={item.category?.icon}
              variant="soft"
              color={statusDotColorMap[status]}
            />
            <div className="flex flex-row gap-2 items-center">
              {item.category && (
                <span className="text-xs font-light text-default-500 truncate">
                  {item.category.name}
                </span>
              )}

              <div className="flex flex-row gap-2 shrink-0">
                {item.notes && <NotePopover content={item.notes} />}
                {item.paymentLink && (
                  <Link href={item.paymentLink} target="_blank">
                    <RiExternalLinkLine className="text-xl" />
                  </Link>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end shrink-0 gap-0.5">
            <TransactionTypeDecorator type={TransactionType.TRANSFER} size="sm">
              {formatCurrency(item.amount)}
            </TransactionTypeDecorator>
            <span className="text-xs font-light text-default-500">
              {formatDate(new Date(item.createdAt))}
            </span>
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
