import { formatCurrency } from "@/config/utils";
import { Button, Chip, Table } from "@heroui/react";
import { useIsMobile } from "@/hooks/useIsMobile";
import { TableColumn, RenderCellProps } from "@/interfaces/global";
import { Account } from "@/interfaces/account";
import { JSX } from "react";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";
import { TransactionTypeDecorator } from "@/components/TransactionTypeDecorator";
import { IconEdit } from "@/components/shared/icons";
import { DeleteTableItemButton } from "@/components/DeleteTableItemButton";

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
  {
    key: "actions",
    className: "uppercase text-center",
  },
];

const columnsMobile: TableColumn[] = [
  {
    key: "account",
    className: "uppercase",
    isRowHeader: true,
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
  onEdit,
  onDelete,
  isDeleteDisabled,
}: RenderCellProps<Account>): JSX.Element => {
  if (key === "account") {
    return (
      <Table.Cell>
        <div className="flex flex-row items-end justify-start gap-2">
          <span className="text-4xl">{item.icon}</span>
          <div className="flex flex-col gap-1">
            <span className="font-bold">{item.name}</span>
            <div className="flex gap-2 text-sm">
              <TransactionTypeDecorator
                size="sm"
                color={item.balance >= 0 ? "success" : "danger"}
              >
                {formatCurrency(item.balance)}
              </TransactionTypeDecorator>
              <Chip variant="tertiary" size="sm" className="rounded-sm">
                <span className="text-xs font-light">{t?.(item.type)}</span>
              </Chip>
            </div>
          </div>
          <div className="flex ml-auto gap-1">
            <Button
              isIconOnly
              variant="tertiary"
              className="self-center text-warning"
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
      </Table.Cell>
    );
  } else {
    return <></>;
  }
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
