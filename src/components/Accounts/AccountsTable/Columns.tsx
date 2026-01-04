import { formatCurrency } from "@/config/utils";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import { TableCell } from "@heroui/table";
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
  t,
  onEdit,
  onDelete,
  isDeleteDisabled,
}: RenderCellProps<Account>): JSX.Element => {
  if (key === "account") {
    return (
      <TableCell>
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
              <Chip radius="sm" variant="flat" size="sm">
                <span className="text-xs font-light">{t?.(item.type)}</span>
              </Chip>
            </div>
          </div>
          <div className="flex ml-auto gap-1">
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
      </TableCell>
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
    rowHeight: isMobile ? 70 : 52,
  };
};
