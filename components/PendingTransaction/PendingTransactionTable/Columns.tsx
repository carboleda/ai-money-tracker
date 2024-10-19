import { formatCurrency, formatDate } from "@/config/utils";
import { Transaction, TransactionType } from "@/interfaces/transaction";
import { Chip } from "@nextui-org/chip";
import { TableCell } from "@nextui-org/table";
import { useIsMobile } from "@/hooks/useIsMobile";
import { TableColumn } from "@/interfaces/global";
import { TransactionTypeDecorator } from "@/components/TransactionTypeDecorator";
import Link from "next/link";
import { IconComment, IconLink } from "@/components/shared/icons";

const columnsDesktop: TableColumn[] = [
  {
    key: "date",
    label: "DATE",
  },
  {
    key: "description",
    label: "DESCRIPTION",
    className: "text-start",
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
    key: "transaction",
    label: "TRANSACTION",
  },
  {
    key: "actions",
    label: "ACTIONS",
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
                <Chip radius="sm" variant="flat" size="sm" className="ml-2">
                  {item.category}
                </Chip>
              )}
            </span>

            <span className="text-gray-400">{item.description}</span>
            {item.notes && (
              <span onClick={() => navigator.clipboard.writeText(item.notes!)}>
                <IconComment size={20} />
              </span>
            )}
          </div>
        </TableCell>
      );
    case "date":
      return <TableCell>{formatDate(new Date(item.createdAt))}</TableCell>;
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
              <span>{item.description}</span>
              {item.notes && (
                <span
                  onClick={() => navigator.clipboard.writeText(item.notes!)}
                >
                  <IconComment size={20} />
                </span>
              )}
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

  return { columns, renderCell };
};
