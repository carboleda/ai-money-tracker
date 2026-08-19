import { LocaleNamespace } from "@/i18n/namespace";
import { toast } from "@heroui/react";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";

type ToastConfig = {
  title?: string;
  description?: string;
  timeout?: number;
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
    toast.success(title ?? "", rest);
  }, []);

  const showErrorToast = useCallback(({ title, ...rest }: ToastConfig) => {
    toast.danger(title ?? "", rest);
  }, []);

  const showConfirmDeleteToast = useCallback(
    ({ onConfirm, title, ...rest }: ToastConfirmConfig) => {
      const toastKey = toast.danger(title ?? "", {
        ...rest,
        actionProps: {
          children: t("deleteConfirmation.confirmButton"),
          "aria-label": t("deleteConfirmation.confirmButton"),
          variant: "danger",
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
