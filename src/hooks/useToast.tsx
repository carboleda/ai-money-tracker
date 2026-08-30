import { LocaleNamespace } from "@/i18n/namespace";
import { toast } from "@heroui/react";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { FaCheckCircle } from "react-icons/fa";
import { IoTrashBin } from "react-icons/io5";

type ToastConfig = {
  title?: string;
  description?: string;
  timeout?: number;
  onClose?: () => void;
};

type ToastConfirmConfig = ToastConfig & {
  onConfirm: () => void;
};

interface UseToastReturn {
  showSuccessToast: (config: ToastConfig) => void;
  showErrorToast: (config: ToastConfig) => void;
  showConfirmDeleteToast: (config: ToastConfirmConfig) => void;
}

export const useToast = (): UseToastReturn => {
  const { t } = useTranslation(LocaleNamespace.Common);

  const showSuccessToast = useCallback(({ title, ...rest }: ToastConfig) => {
    toast.success(title ?? "", {
      indicator: <FaCheckCircle />,
      ...rest,
    });
  }, []);

  const showErrorToast = useCallback(({ title, ...rest }: ToastConfig) => {
    toast.danger(title ?? "", {
      indicator: <IoTrashBin />,
      ...rest,
    });
  }, []);

  const showConfirmDeleteToast = useCallback(
    ({ onConfirm, title, ...rest }: ToastConfirmConfig) => {
      const toastKey = toast.danger(title ?? "", {
        ...rest,
        indicator: <IoTrashBin />,
        actionProps: {
          children: t("deleteConfirmation.confirmButton"),
          "aria-label": t("deleteConfirmation.confirmButton"),
          variant: "danger-soft",
          onPress: () => {
            onConfirm();
            toast.close(toastKey);
          },
        },
      });
    },
    [t]
  );

  return { showSuccessToast, showErrorToast, showConfirmDeleteToast };
};
