"use client";

import {
  Description,
  Label,
  ListBox,
  Radio,
  RadioGroup,
  Select,
  Separator,
  Surface,
  Switch,
} from "@heroui/react";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { HiOutlineBell } from "react-icons/hi";
import { LocaleNamespace } from "@/i18n/namespace";
import { EmailStrategy } from "@/app/api/domain/user/model/user.model";
import { UserSettings } from "@/interfaces/user";
import { firebaseApp } from "@/firebase/client";
import { requestFcmToken } from "@/firebase/client/messaging";
import { useMutateUser } from "@/hooks/useMutateUser";
import { useToast } from "@/hooks/useToast";

interface NotificationsSectionProps {
  hdieTitle?: boolean;
  settings?: UserSettings;
  onUpdate: (patch: Partial<UserSettings>) => void;
}

const EARLY_REMINDER_OPTIONS = [0, 1, 2, 3, 5, 7] as const;

const EARLY_REMINDER_LABEL_KEYS: Record<number, string> = {
  0: "sameDay",
  1: "oneDayBefore",
  2: "twoDaysBefore",
  3: "threeDaysBefore",
  5: "fiveDaysBefore",
  7: "sevenDaysBefore",
};

export const NotificationsSection: React.FC<NotificationsSectionProps> = ({
  hdieTitle = false,
  settings,
  onUpdate,
}) => {
  const { t } = useTranslation(LocaleNamespace.Preferences);
  const { updateUser } = useMutateUser();
  const { showErrorToast } = useToast();

  const pushNotificationsEnabled = settings?.pushNotificationsEnabled !== false;
  const emailStrategy = settings?.emailStrategy ?? EmailStrategy.STANDALONE;
  const earlyReminderDaysAhead = settings?.earlyReminderDaysAhead ?? 1;
  const paymentNotificationsEnabled =
    settings?.paymentNotificationsEnabled !== false;

  const onPushNotificationsChange = async (next: boolean) => {
    if (!next || typeof Notification === "undefined") {
      onUpdate({ pushNotificationsEnabled: next });
      return;
    }

    if (Notification.permission === "granted") {
      onUpdate({ pushNotificationsEnabled: true });
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      showErrorToast({ title: t("notificationsPermissionDenied") });
      return;
    }

    const device = await requestFcmToken(firebaseApp);
    if (device) {
      await updateUser({ devices: [device] });
    }

    onUpdate({ pushNotificationsEnabled: true });
  };

  const onEmailStrategyChange = (value: string) => {
    onUpdate({ emailStrategy: value as EmailStrategy });
  };

  const onEarlyReminderChange = (value: React.Key | null) => {
    if (value === null) return;
    onUpdate({ earlyReminderDaysAhead: Number(value) });
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      {!hdieTitle && (
        <div className="flex items-center gap-2 text-foreground font-semibold">
          <HiOutlineBell className="text-2xl" />
          {t("notifications")}
        </div>
      )}

      <Surface
        variant="secondary"
        className="flex flex-col gap-4 w-full p-4 rounded-2xl"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <Label>{t("pushNotifications")}</Label>
            <span className="text-xs text-muted">
              {t("pushNotificationsHelper")}
            </span>
          </div>
          <Switch
            isSelected={pushNotificationsEnabled}
            onChange={onPushNotificationsChange}
            aria-label={t("pushNotifications")}
          >
            <Switch.Content>
              <Switch.Control>
                <Switch.Thumb />
              </Switch.Control>
            </Switch.Content>
          </Switch>
        </div>

        <Separator variant="tertiary" />

        <RadioGroup
          name="emailStrategy"
          value={emailStrategy}
          onChange={onEmailStrategyChange}
          isDisabled={!pushNotificationsEnabled}
        >
          <Label>{t("dailyReminderFormat")}</Label>
          <Radio value={EmailStrategy.STANDALONE}>
            <Radio.Content>
              <Radio.Control>
                <Radio.Indicator />
              </Radio.Control>
              {t("standalone")}
            </Radio.Content>
            <Description>{t("standaloneHelper")}</Description>
          </Radio>
          <Radio value={EmailStrategy.DIGEST}>
            <Radio.Content>
              <Radio.Control>
                <Radio.Indicator />
              </Radio.Control>
              {t("digest")}
            </Radio.Content>
            <Description>{t("digestHelper")}</Description>
          </Radio>
        </RadioGroup>

        <Separator variant="tertiary" />

        <Select
          value={earlyReminderDaysAhead}
          onChange={onEarlyReminderChange}
          aria-label={t("earlyReminderTiming")}
          isDisabled={!pushNotificationsEnabled}
          className="w-fit"
        >
          <Label>{t("earlyReminderTiming")}</Label>
          <Description>{t("earlyReminderTimingHelper")}</Description>
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox aria-label={t("earlyReminderTiming")}>
              {EARLY_REMINDER_OPTIONS.map((daysAhead) => (
                <ListBox.Item
                  key={daysAhead}
                  id={daysAhead}
                  textValue={t(EARLY_REMINDER_LABEL_KEYS[daysAhead])}
                >
                  {t(EARLY_REMINDER_LABEL_KEYS[daysAhead])}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>

        <Separator variant="tertiary" />

        <div
          className={clsx(
            "flex items-center justify-between gap-3",
            !pushNotificationsEnabled && "opacity-50",
          )}
        >
          <div className="flex flex-col">
            <Label>{t("appleWallet")}</Label>
            <span className="text-xs text-muted">{t("appleWalletHelper")}</span>
          </div>
          <Switch
            isSelected={paymentNotificationsEnabled}
            onChange={(next) => onUpdate({ paymentNotificationsEnabled: next })}
            aria-label={t("appleWallet")}
            isDisabled={!pushNotificationsEnabled}
          >
            <Switch.Content>
              <Switch.Control>
                <Switch.Thumb />
              </Switch.Control>
            </Switch.Content>
          </Switch>
        </div>
      </Surface>
    </div>
  );
};
