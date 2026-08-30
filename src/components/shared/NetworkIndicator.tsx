import { Chip } from "@heroui/react";
import { MdWifiOff } from "react-icons/md";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

export const NetworkIndicator = () => {
  const { isOnline } = useOnlineStatus();
  const { t } = useTranslation(LocaleNamespace.Common);

  if (isOnline) return null;

  return (
    <Chip color="default" size="sm" variant="tertiary">
      <MdWifiOff />
      {t("offline.indicator")}
    </Chip>
  );
};
