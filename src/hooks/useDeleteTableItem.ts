import { LocaleNamespace } from "@/i18n/namespace";
import { useTranslation } from "react-i18next";
import { useToast } from "./useToast";

const CONFIRMATION_TIME = 6000;

interface UseDeleteTableItemProps {
  onConfirmDelete: (id: string) => void;
}

export const useDeleteTableItem = ({
  onConfirmDelete,
}: UseDeleteTableItemProps) => {
  const { t } = useTranslation(LocaleNamespace.Common);
  const { showConfirmDeleteToast, showSuccessToast } = useToast();

  const onDelete = async (itemId: string, label?: string) => {
    return new Promise((resolve) => {
      showConfirmDeleteToast({
        title: t("deleteConfirmation.title"),
        description: label
          ? t("deleteConfirmation.descriptionWithLabel", { label })
          : t("deleteConfirmation.description"),
        timeout: CONFIRMATION_TIME,
        onConfirm: () => {
          onConfirmDelete(itemId);
          showSuccessToast({
            title: t("itemDeleted"),
          });
          resolve(true);
        },
        onClose: () => {
          resolve(false);
        },
      });
    });
  };

  return {
    onDelete,
  };
};
