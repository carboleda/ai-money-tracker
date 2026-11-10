"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { HiOutlineBell } from "react-icons/hi";
import { HiChartPie, HiOutlinePuzzlePiece } from "react-icons/hi2";
import { LocaleNamespace } from "@/i18n/namespace";
import { EmailStrategy } from "@/app/api/domain/user/model/user.model";
import { UserSettings } from "@/interfaces/user";
import { useAppStore } from "@/stores/useAppStore";
import { LogOutButton } from "@/components/shared/Sidebar/LogOutButton";
import { ProfileSection } from "./ProfileSection";
import { GeneralPreferencesSection } from "./GeneralPreferencesSection";
import { SummaryPreferencesSection } from "./SummaryPreferencesSection";
import { NotificationsSection } from "./NotificationsSection";
import { IntegrationsSection } from "./IntegrationsSection";
import { PreferenceNavTile } from "./PreferenceNavTile";

type View = "main" | "summary" | "notifications" | "integrations";

interface PreferencesMobileViewProps {
  profile: { name?: string; email?: string; picture?: string } | null;
  settings?: UserSettings;
  onUpdate: (patch: Partial<UserSettings>) => void;
}

export const PreferencesMobileView: React.FC<PreferencesMobileViewProps> = ({
  profile,
  settings,
  onUpdate,
}) => {
  const { t } = useTranslation(LocaleNamespace.Preferences);
  const { setPageTitle, setBackButtonVisible, backPressCount } = useAppStore();
  const [view, setView] = useState<View>("main");

  // Swap the Navbar's menu button for a back button, and its title, while
  // the Notifications sub-view is open; restore both when going back.
  useEffect(() => {
    if (view === "summary") {
      setPageTitle(t("summary"));
      setBackButtonVisible(true);
    } else if (view === "notifications") {
      setPageTitle(t("notifications"));
      setBackButtonVisible(true);
    } else if (view === "integrations") {
      setPageTitle(t("integrations"));
      setBackButtonVisible(true);
    } else {
      setPageTitle(
        t("preferences", { ns: LocaleNamespace.Common }),
        t("subtitle"),
      );
      setBackButtonVisible(false);
    }
  }, [view, t, setPageTitle, setBackButtonVisible]);

  // The Navbar's back button only bumps a counter in the store; react to it
  // here by returning to the main view ourselves.
  useEffect(() => {
    setView("main");
  }, [backPressCount]);

  // Never leave a stale back button in the Navbar if the user navigates
  // away from this page entirely while the sub-view is open.
  useEffect(() => () => setBackButtonVisible(false), [setBackButtonVisible]);

  if (view === "summary") {
    return (
      <div className="flex flex-col gap-4 w-full">
        <SummaryPreferencesSection
          hdieTitle
          settings={settings}
          onUpdate={onUpdate}
        />
      </div>
    );
  }

  if (view === "notifications") {
    return (
      <div className="flex flex-col gap-4 w-full">
        <NotificationsSection
          hdieTitle
          settings={settings}
          onUpdate={onUpdate}
        />
      </div>
    );
  }

  if (view === "integrations") {
    return (
      <div className="flex flex-col gap-4 w-full">
        <IntegrationsSection hdieTitle />
      </div>
    );
  }

  const pushState =
    settings?.pushNotificationsEnabled !== false ? t("pushOn") : t("pushOff");
  const reminderFormat =
    (settings?.emailStrategy ?? EmailStrategy.STANDALONE) ===
    EmailStrategy.DIGEST
      ? t("digest")
      : t("standalone");
  const walletState =
    settings?.paymentNotificationsEnabled !== false ? t("on") : t("off");

  const forecastHorizonMonths = settings?.forecastHorizonMonths ?? 3;
  const recentTransactionsLimit = settings?.recentTransactionsLimit ?? 7;
  const historyWindowMonths = settings?.historyWindowMonths ?? 12;

  return (
    <div className="flex flex-col gap-4 w-full">
      <ProfileSection profile={profile} />
      <GeneralPreferencesSection settings={settings} onUpdate={onUpdate} />

      <PreferenceNavTile
        icon={<HiChartPie className="text-2xl shrink-0" />}
        title={t("summary")}
        preview={t("summaryPreview", {
          horizon: forecastHorizonMonths,
          count: recentTransactionsLimit,
          window: historyWindowMonths,
        })}
        onClick={() => setView("summary")}
      />

      <PreferenceNavTile
        icon={<HiOutlineBell className="text-2xl shrink-0" />}
        title={t("notifications")}
        preview={t("notificationsPreview", {
          pushState,
          reminderFormat,
          walletState,
        })}
        onClick={() => setView("notifications")}
      />

      <PreferenceNavTile
        icon={<HiOutlinePuzzlePiece className="text-2xl shrink-0" />}
        title={t("integrations")}
        preview={t("appleWalletShortcut")}
        onClick={() => setView("integrations")}
      />

      <LogOutButton />
    </div>
  );
};
