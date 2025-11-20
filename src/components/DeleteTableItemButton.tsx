import { Button, ButtonProps } from "@heroui/button";
import { FaRegCircleXmark } from "react-icons/fa6";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";
import { useToast } from "@/hooks/useToast";

const CONFIRMATION_TIME = 8000;

interface DeleteTableItemButtonProps extends ButtonProps {
  itemId: string;
  isDisabled?: boolean;
  deleteTableItem: (id: string) => void;
}

export const DeleteTableItemButton: React.FC<DeleteTableItemButtonProps> = ({
  itemId,
  isDisabled = false,
  deleteTableItem,
  ...props
}) => {
  const { t } = useTranslation(LocaleNamespace.Common);
  const { showConfirmDeleteToast, showSuccessToast } = useToast();

  const onClick = () => {
    showConfirmDeleteToast({
      title: t("deleteConfirmation.title"),
      description: t("deleteConfirmation.description"),
      timeout: CONFIRMATION_TIME,
      onConfirm: () => {
        deleteTableItem(itemId);
        showSuccessToast({
          title: t("itemDeleted"),
        });
      },
    });
  };

  return (
    <Button
      isIconOnly
      color="danger"
      variant="light"
      className="self-center"
      aria-label={t("delete")}
      size="sm"
      disabled={isDisabled}
      onPress={onClick}
      {...props}
    >
      <FaRegCircleXmark className="text-xl" />
    </Button>
  );
};
