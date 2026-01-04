import { formatCurrency } from "@/config/utils";
import { Chip } from "@heroui/chip";
import { TableCell, TableRow } from "@heroui/table";
import { useIsMobile } from "@/hooks/useIsMobile";
import { TableColumn, RenderCellProps } from "@/interfaces/global";
import { Account } from "@/interfaces/account";
import { JSX } from "react";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";
import { TransactionTypeDecorator } from "@/components/TransactionTypeDecorator";

const columnsDesktop: TableColumn[] = [
  {
    key: "icon",
    className: "uppercase",
  },
  {
    key: "ref",
    className: "uppercase",
  },
  {
    key: "name",
    className: "uppercase",
  },
  {
    key: "type",
    className: "uppercase",
  },
  {
    key: "balance",
    className: "uppercase text-end",
  },
  {
    key: "actions",
    className: "uppercase text-center",
  },
];

const columnsMobile: TableColumn[] = [
  {
    key: "account",
    className: "uppercase",
  },
];

const renderCellDesktop = ({
  key,
  item,
  t,
}: RenderCellProps<Account>): JSX.Element => {
  switch (key) {
    case "icon":
      return (
        <TableCell>
          <div className="text-2xl">{item.icon}</div>
        </TableCell>
      );
    case "ref":
      return (
        <TableCell>
          <Chip radius="sm" variant="flat" className="font-bold">
            {item.ref}
          </Chip>
        </TableCell>
      );
    case "name":
      return <TableCell>{item.name}</TableCell>;
    case "type":
      return <TableCell>{t?.(item.type)}</TableCell>;
    case "balance":
      return (
        <TableCell className="text-end font-bold">
          <TransactionTypeDecorator
            color={item.balance >= 0 ? "success" : "danger"}
          >
            {formatCurrency(item.balance)}
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
}: RenderCellProps<Account>): JSX.Element => {
  switch (key) {
    case "account":
      return (
        <TableCell>
          <div className="flex flex-row items-center gap-2">
            <span className="text-2xl">{item.icon}</span>
            <div className="flex flex-col">
              <span className="font-bold">{item.name}</span>
              <span className="text-sm">
                <TransactionTypeDecorator
                  size="sm"
                  color={item.balance >= 0 ? "success" : "danger"}
                >
                  {formatCurrency(item.balance)}
                </TransactionTypeDecorator>
              </span>
            </div>
          </div>
        </TableCell>
      );
    default:
      return <></>;
  }
};

interface UseRenderCellReturn {
  columns: TableColumn[];
  renderCell: ({ key, item }: RenderCellProps<Account>) => JSX.Element;
  rowHeight: number;
  renderSeparator: (id: string, colSpan: number, title: string) => JSX.Element;
}

export const useRenderCell = (): UseRenderCellReturn => {
  const isMobile = useIsMobile();
  const { t } = useTranslation(LocaleNamespace.Accounts);

  const columns = isMobile ? columnsMobile : columnsDesktop;

  const renderCell = ({ key, item }: RenderCellProps<Account>): JSX.Element => {
    if (isMobile) {
      return renderCellMobile({ key, item, t });
    }

    return renderCellDesktop({ key, item, t });
  };

  const renderSeparator = (
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

  return {
    columns,
    renderCell,
    rowHeight: isMobile ? 80 : 52,
    renderSeparator,
  };
};
