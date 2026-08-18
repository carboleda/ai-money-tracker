import { Chip } from "@heroui/chip";
import { MdWifiOff } from "react-icons/md";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

export const NetworkIndicator = () => {
  const { isOnline } = useOnlineStatus();
  const { t } = useTranslation(LocaleNamespace.Common);

  if (isOnline) return null;

  return (
    <Chip color="warning" size="sm" variant="flat" avatar={<MdWifiOff />}>
      {t("offline.indicator")}
    </Chip>
  );
};
