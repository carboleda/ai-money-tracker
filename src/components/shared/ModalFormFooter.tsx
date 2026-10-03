import { Modal, Button } from "@heroui/react";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";
import { LoadingButton } from "@/components/shared/LoadingButton";

interface ModalFormFooterProps {
  isPending: boolean;
  isDisabled: boolean;
  onCancel: () => void;
  onSave: () => void;
  saveLabel?: string;
}

export const ModalFormFooter: React.FC<ModalFormFooterProps> = ({
  isPending,
  isDisabled,
  onCancel,
  onSave,
  saveLabel,
}) => {
  const { t } = useTranslation(LocaleNamespace.Common);

  return (
    <Modal.Footer>
      <Button
        variant="danger-soft"
        isDisabled={isDisabled}
        onPress={onCancel}
      >
        {t("cancel")}
      </Button>
      <LoadingButton
        variant="primary"
        isPending={isPending}
        isDisabled={isDisabled}
        onPress={onSave}
      >
        {saveLabel ?? t("save")}
      </LoadingButton>
    </Modal.Footer>
  );
};
