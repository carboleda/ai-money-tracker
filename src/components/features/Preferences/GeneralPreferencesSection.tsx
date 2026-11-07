"use client";

import { useEffect } from "react";
import i18next, { changeLanguage } from "i18next";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";
import { useIsSSR } from "@react-aria/ssr";
import {
  Label,
  ListBox,
  Select,
  Surface,
  ToggleButton,
  ToggleButtonGroup,
} from "@heroui/react";
import { LocaleNamespace } from "@/i18n/namespace";
import { UserSettings } from "@/interfaces/user";
import { IoSettingsOutline } from "react-icons/io5";

interface GeneralPreferencesSectionProps {
  settings?: UserSettings;
  onUpdate: (patch: Partial<UserSettings>) => void;
}

const MONTHLY_REPORT_DAYS = Array.from({ length: 5 }, (_, i) => i + 1);

const APPEARANCE_OPTIONS = ["system", "light", "dark"] as const;
type Appearance = (typeof APPEARANCE_OPTIONS)[number];

const APPEARANCE_LABEL_KEYS: Record<Appearance, string> = {
  system: "systemDefault",
  light: "light",
  dark: "dark",
};

export const GeneralPreferencesSection: React.FC<
  GeneralPreferencesSectionProps
> = ({ settings, onUpdate }) => {
  const { t } = useTranslation(LocaleNamespace.Preferences);
  const { theme, setTheme } = useTheme();
  const isSSR = useIsSSR();
  const appearance: Appearance = isSSR
    ? "system"
    : ((theme as Appearance) ?? "system");

  // Keep the active UI language in sync with the persisted setting once it
  // loads, so the choice follows the user across devices/reloads.
  useEffect(() => {
    if (settings?.language && settings.language !== i18next.language) {
      void changeLanguage(settings.language);
    }
  }, [settings?.language]);

  const language =
    settings?.language ?? (i18next.language as "en" | "es") ?? "en";
  const monthlyReportDay = settings?.monthlyReportDay ?? 2;

  const onLanguageChange = (value: React.Key | null) => {
    if (!value) return;
    const next = value as "en" | "es";
    void changeLanguage(next);
    onUpdate({ language: next });
  };

  const onMonthlyReportDayChange = (value: React.Key | null) => {
    if (!value) return;
    onUpdate({ monthlyReportDay: Number(value) });
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center gap-2 text-foreground font-semibold">
        <IoSettingsOutline className="text-2xl" />
        {t("general")}
      </div>
      <Surface
        variant="secondary"
        className="flex flex-col gap-4 w-full p-4 rounded-2xl"
      >
        <Select
          value={language}
          onChange={onLanguageChange}
          aria-label={t("language")}
          className="w-fit"
        >
          <Label>{t("language")}</Label>
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox aria-label={t("language")}>
              <ListBox.Item id="en" textValue={t("english")} className="mr-5">
                {t("english")}
                <ListBox.ItemIndicator />
              </ListBox.Item>
              <ListBox.Item id="es" textValue={t("spanish")} className="mr-5">
                {t("spanish")}
                <ListBox.ItemIndicator />
              </ListBox.Item>
            </ListBox>
          </Select.Popover>
        </Select>

        <Select
          value={monthlyReportDay}
          onChange={onMonthlyReportDayChange}
          aria-label={t("monthlyReportDay")}
          className="w-fit"
        >
          <Label>{t("monthlyReportDay")}</Label>
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox aria-label={t("monthlyReportDay")}>
              {MONTHLY_REPORT_DAYS.map((day) => (
                <ListBox.Item key={day} id={day} textValue={String(day)}>
                  {t("monthlyReportDayOf", { day })}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>

        <div className="flex flex-col gap-2">
          <Label>{t("appearance")}</Label>
          <ToggleButtonGroup
            selectionMode="single"
            disallowEmptySelection
            selectedKeys={[appearance]}
            onSelectionChange={(keys) => setTheme([...keys][0] as Appearance)}
            aria-label={t("appearance")}
          >
            {APPEARANCE_OPTIONS.map((option, index) => (
              <ToggleButton key={option} id={option}>
                {index > 0 && <ToggleButtonGroup.Separator />}
                {t(APPEARANCE_LABEL_KEYS[option])}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </div>
      </Surface>
    </div>
  );
};
