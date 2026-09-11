import { Chip, ProgressCircle } from "@heroui/react";
import { MdWifiOff } from "react-icons/md";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useIsFetching } from "@tanstack/react-query";

export const NetworkIndicator = () => {
  const { isOnline } = useOnlineStatus();
  const isFetching = useIsFetching();
  const { t } = useTranslation(LocaleNamespace.Common);

  if (!isOnline) {
    return (
      <Chip color="default" size="sm" variant="tertiary">
        <MdWifiOff />
        {t("offline.indicator")}
      </Chip>
    );
  }

  if (isFetching) {
    return (
      <ProgressCircle isIndeterminate size="sm" aria-label="Loading">
        <ProgressCircle.Track>
          <ProgressCircle.TrackCircle />
          <ProgressCircle.FillCircle />
        </ProgressCircle.Track>
      </ProgressCircle>
    );
  }

  return null;
};
