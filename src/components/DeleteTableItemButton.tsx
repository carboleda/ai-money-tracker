import { Button, ButtonProps } from "@heroui/react";
import { FaRegCircleXmark } from "react-icons/fa6";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";
import { useDeleteTableItem } from "@/hooks/useDeleteTableItem";

interface DeleteTableItemButtonProps extends ButtonProps {
  itemId: string;
  isDisabled?: boolean;
  deleteTableItem: (id: string) => void;
}

export const DeleteTableItemButton: React.FC<DeleteTableItemButtonProps> = ({
  itemId,
  isDisabled = false,
  deleteTableItem: onConfirmDelete,
  ...props
}) => {
  const { t } = useTranslation(LocaleNamespace.Common);
  const { onDelete } = useDeleteTableItem({
    onConfirmDelete,
  });

  return (
    <Button
      isIconOnly
      variant="danger-soft"
      className="self-center"
      aria-label={t("delete")}
      size="sm"
      isDisabled={isDisabled}
      onPress={() => onDelete(itemId)}
      {...props}
    >
      <FaRegCircleXmark className="text-xl" />
    </Button>
  );
};
