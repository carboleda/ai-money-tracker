"use client";

import { useTranslation } from "react-i18next";
import {
  Description,
  Label,
  ListBox,
  Select,
  Surface,
  ToggleButton,
  ToggleButtonGroup,
} from "@heroui/react";
import { LocaleNamespace } from "@/i18n/namespace";
import { UserSettings } from "@/interfaces/user";
import { HiChartPie } from "react-icons/hi2";

interface SummaryPreferencesSectionProps {
  hdieTitle?: boolean;
  settings?: UserSettings;
  onUpdate: (patch: Partial<UserSettings>) => void;
}

const FORECAST_HORIZON_OPTIONS = [3, 4, 5, 6] as const;
const FORECAST_BASELINE_OPTIONS = [3, 6, 10, 12] as const;
const RECENT_TRANSACTIONS_OPTIONS = [5, 7, 10] as const;
const HISTORY_WINDOW_OPTIONS = [6, 12] as const;

export const SummaryPreferencesSection: React.FC<
  SummaryPreferencesSectionProps
> = ({ hdieTitle = false, settings, onUpdate }) => {
  const { t } = useTranslation(LocaleNamespace.Preferences);

  const forecastHorizonMonths = settings?.forecastHorizonMonths ?? 3;
  const forecastBaselineMonths = settings?.forecastBaselineMonths ?? 3;
  const recentTransactionsLimit = settings?.recentTransactionsLimit ?? 7;
  const historyWindowMonths = settings?.historyWindowMonths ?? 12;

  const onForecastHorizonChange = (value: React.Key | null) => {
    if (!value) return;
    onUpdate({
      forecastHorizonMonths: Number(
        value,
      ) as UserSettings["forecastHorizonMonths"],
    });
  };

  const onForecastBaselineChange = (value: React.Key | null) => {
    if (!value) return;
    onUpdate({
      forecastBaselineMonths: Number(
        value,
      ) as UserSettings["forecastBaselineMonths"],
    });
  };

  const onRecentTransactionsChange = (value: React.Key | null) => {
    if (!value) return;
    onUpdate({
      recentTransactionsLimit: Number(
        value,
      ) as UserSettings["recentTransactionsLimit"],
    });
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      {!hdieTitle && (
        <div className="flex items-center gap-2 text-foreground font-semibold">
          <HiChartPie className="text-2xl" />
          {t("summary")}
        </div>
      )}
      <Surface
        variant="secondary"
        className="flex flex-col gap-4 w-full p-4 rounded-2xl"
      >
        <Select
          value={forecastHorizonMonths}
          onChange={onForecastHorizonChange}
          aria-label={t("forecastHorizon")}
          className="w-fit"
        >
          <Label>{t("forecastHorizon")}</Label>
          <Description>{t("forecastHorizonHelper")}</Description>
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox aria-label={t("forecastHorizon")}>
              {FORECAST_HORIZON_OPTIONS.map((months) => (
                <ListBox.Item
                  key={months}
                  id={months}
                  textValue={String(months)}
                  className="mr-5"
                >
                  {t("forecastHorizonOf", { months })}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>

        <Select
          value={forecastBaselineMonths}
          onChange={onForecastBaselineChange}
          aria-label={t("forecastBaseline")}
          className="w-fit"
        >
          <Label>{t("forecastBaseline")}</Label>
          <Description>{t("forecastBaselineHelper")}</Description>
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox aria-label={t("forecastBaseline")}>
              {FORECAST_BASELINE_OPTIONS.map((months) => (
                <ListBox.Item
                  key={months}
                  id={months}
                  textValue={String(months)}
                  className="mr-5"
                >
                  {t("forecastBaselineOf", { months })}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>

        <Select
          value={recentTransactionsLimit}
          onChange={onRecentTransactionsChange}
          aria-label={t("recentTransactionsCount")}
          className="w-fit"
        >
          <Label>{t("recentTransactionsCount")}</Label>
          <Description>{t("recentTransactionsCountHelper")}</Description>
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox aria-label={t("recentTransactionsCount")}>
              {RECENT_TRANSACTIONS_OPTIONS.map((count) => (
                <ListBox.Item
                  key={count}
                  id={count}
                  textValue={String(count)}
                  className="mr-5"
                >
                  {t("recentTransactionsCountOf", { count })}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>

        <div className="flex flex-col gap-2">
          <Label>{t("historyWindow")}</Label>
          <span className="text-xs text-muted">{t("historyWindowHelper")}</span>
          <ToggleButtonGroup
            selectionMode="single"
            disallowEmptySelection
            selectedKeys={[String(historyWindowMonths)]}
            onSelectionChange={(keys) =>
              onUpdate({
                historyWindowMonths: Number(
                  [...keys][0],
                ) as UserSettings["historyWindowMonths"],
              })
            }
            aria-label={t("historyWindow")}
          >
            {HISTORY_WINDOW_OPTIONS.map((months, index) => (
              <ToggleButton key={months} id={String(months)}>
                {index > 0 && <ToggleButtonGroup.Separator />}
                {t(months === 6 ? "sixMonths" : "twelveMonths")}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </div>
      </Surface>
    </div>
  );
};
