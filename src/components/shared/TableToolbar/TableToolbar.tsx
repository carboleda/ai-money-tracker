import { ButtonGroup, Button, Typography } from "@heroui/react";
import { IoTrashBin } from "react-icons/io5";
import { IconEdit } from "../icons";
import clsx from "clsx";
import { TFunction } from "i18next";

interface TableToolbarProps {
  selectedItem?: { id: string; description: string };
  isMutating: boolean;
  rowCount?: number;
  onEdit: (item: any) => void;
  onDelete: (id: string, label?: string) => void;
  t: TFunction;
}

export const TableToolbar: React.FC<TableToolbarProps> = ({
  selectedItem,
  onEdit,
  onDelete,
  isMutating,
  rowCount,
  t,
}) => {
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
            aria-label={t("edit")}
            {...(selectedItem && { onPress: () => onEdit(selectedItem) })}
          >
            <IconEdit />
            {t("edit")}
          </Button>
          <Button
            isDisabled={isMutating}
            {...(selectedItem && {
              onPress: () =>
                onDelete(selectedItem.id, selectedItem.description),
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
