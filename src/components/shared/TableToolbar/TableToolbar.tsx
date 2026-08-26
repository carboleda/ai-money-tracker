import { ButtonGroup, Button, Typography } from "@heroui/react";
import { IoTrashBin } from "react-icons/io5";
import { IconEdit } from "../icons";
import clsx from "clsx";
import { TFunction } from "i18next";

interface TableToolbarProps {
  selectedItem?: { id: string } & Record<string, any>;
  isMutating: boolean;
  rowCount?: number;
  onEdit: (item: any) => void;
  onDelete: (id: string, label?: string) => void;
  t: TFunction;
  getItemLabel?: (item: any) => string | undefined;
  editLabel?: string;
  editIcon?: React.ReactNode;
}

export const TableToolbar: React.FC<TableToolbarProps> = ({
  selectedItem,
  onEdit,
  onDelete,
  isMutating,
  rowCount,
  t,
  getItemLabel,
  editLabel,
  editIcon,
}) => {
  const itemLabel = selectedItem
    ? getItemLabel?.(selectedItem) ?? selectedItem.description
    : undefined;

  return (
    <div className="flex flex-row gap-1 items-center py-2 justify-between">
      <div
        className={clsx({
          visible: selectedItem,
          invisible: !selectedItem,
        })}
      >
        <ButtonGroup variant="ghost">
          <Button
            aria-label={editLabel ?? t("edit")}
            {...(selectedItem && { onPress: () => onEdit(selectedItem) })}
          >
            {editIcon ?? <IconEdit />}
            {editLabel ?? t("edit")}
          </Button>
          <Button
            isDisabled={isMutating}
            {...(selectedItem && {
              onPress: () => onDelete(selectedItem.id, itemLabel),
            })}
          >
            <ButtonGroup.Separator />
            <IoTrashBin className="text-danger-soft-foreground" />
            {t("delete")}
          </Button>
        </ButtonGroup>
      </div>
      <div className="pr-3">
        <Typography color="muted" type="body-xs">
          {t("rowCounter", { count: rowCount || 0 })}
        </Typography>
      </div>
    </div>
  );
};
