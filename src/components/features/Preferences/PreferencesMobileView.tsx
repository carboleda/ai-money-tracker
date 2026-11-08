"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Surface } from "@heroui/react";
import { HiOutlineBell, HiChevronRight } from "react-icons/hi";
import { HiOutlinePuzzlePiece } from "react-icons/hi2";
import { LocaleNamespace } from "@/i18n/namespace";
import { EmailStrategy } from "@/app/api/domain/user/model/user.model";
import { UserSettings } from "@/interfaces/user";
import { useAppStore } from "@/stores/useAppStore";
import { LogOutButton } from "@/components/shared/Sidebar/LogOutButton";
import { ProfileSection } from "./ProfileSection";
import { GeneralPreferencesSection } from "./GeneralPreferencesSection";
import { NotificationsSection } from "./NotificationsSection";
import { IntegrationsSection } from "./IntegrationsSection";

type View = "main" | "notifications" | "integrations";

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
    if (view === "notifications") {
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

  return (
    <div className="flex flex-col gap-4 w-full">
      <ProfileSection profile={profile} />
      <GeneralPreferencesSection settings={settings} onUpdate={onUpdate} />

      <Surface
        variant="secondary"
        role="button"
        tabIndex={0}
        onClick={() => setView("notifications")}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setView("notifications");
          }
        }}
        className="flex items-center gap-3 w-full p-4 rounded-2xl text-left min-h-11 cursor-pointer"
      >
        <HiOutlineBell className="text-2xl shrink-0" />
        <div className="flex flex-col flex-1 min-w-0">
          <span className="font-semibold">{t("notifications")}</span>
          <span className="text-xs text-muted truncate">
            {t("notificationsPreview", {
              pushState,
              reminderFormat,
              walletState,
            })}
          </span>
        </div>
        <HiChevronRight className="text-muted shrink-0" />
      </Surface>

      <Surface
        variant="secondary"
        role="button"
        tabIndex={0}
        onClick={() => setView("integrations")}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setView("integrations");
          }
        }}
        className="flex items-center gap-3 w-full p-4 rounded-2xl text-left min-h-11 cursor-pointer"
      >
        <HiOutlinePuzzlePiece className="text-2xl shrink-0" />
        <div className="flex flex-col flex-1 min-w-0">
          <span className="font-semibold">{t("integrations")}</span>
          <span className="text-xs text-muted truncate">
            {t("appleWalletShortcut")}
          </span>
        </div>
        <HiChevronRight className="text-muted shrink-0" />
      </Surface>

      <LogOutButton />
    </div>
  );
};
