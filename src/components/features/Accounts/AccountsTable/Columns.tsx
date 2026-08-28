import { formatCurrency } from "@/config/utils";
import { Chip, Table } from "@heroui/react";
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
    isRowHeader: true,
  },
  {
    key: "type",
    className: "uppercase",
  },
  {
    key: "balance",
    className: "uppercase text-end",
  },
];

const columnsMobile: TableColumn[] = [
  {
    key: "account",
    className: "uppercase",
    isRowHeader: true,
  },
  {
    key: "empty1",
  },
  {
    key: "empty2",
  },
  {
    key: "empty3",
  },
  {
    key: "empty4",
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
        <Table.Cell>
          <div className="text-2xl">{item.icon}</div>
        </Table.Cell>
      );
    case "ref":
      return (
        <Table.Cell>
          <Chip variant="tertiary" className="rounded-sm font-bold">
            {item.ref}
          </Chip>
        </Table.Cell>
      );
    case "name":
      return <Table.Cell>{item.name}</Table.Cell>;
    case "type":
      return <Table.Cell>{t?.(item.type)}</Table.Cell>;
    case "balance":
      return (
        <Table.Cell className="text-end font-bold">
          <TransactionTypeDecorator
            color={item.balance >= 0 ? "success" : "danger"}
          >
            {formatCurrency(item.balance)}
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
  t,
}: RenderCellProps<Account>): JSX.Element => {
  if (key !== "account") return <></>;

  return (
    <Table.Cell colSpan={5}>
      <div className="flex flex-row items-center justify-start gap-4">
        <span className="text-2xl">{item.icon}</span>
        <div className="flex flex-col gap-1">
          <div className="flex gap-2 text-sm">
            <span className="font-bold">{item.name}</span>
            <Chip variant="soft" size="sm" className="rounded-sm">
              <span className="text-xs font-light">{t?.(item.type)}</span>
            </Chip>
          </div>
          <TransactionTypeDecorator
            size="sm"
            color={item.balance >= 0 ? "success" : "danger"}
          >
            {formatCurrency(item.balance)}
          </TransactionTypeDecorator>
        </div>
      </div>
    </Table.Cell>
  );
};

export const useRenderCell = () => {
  const isMobile = useIsMobile();
  const { t } = useTranslation(LocaleNamespace.Accounts);

  const columns = isMobile ? columnsMobile : columnsDesktop;

  const renderCell = (props: RenderCellProps<Account>): JSX.Element => {
    if (isMobile) {
      return renderCellMobile({ ...props, t });
    }

    return renderCellDesktop({ ...props, t });
  };

  return {
    columns,
    renderCell,
  };
};
