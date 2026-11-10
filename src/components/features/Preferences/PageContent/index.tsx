"use client";

import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";
import { useAppStore } from "@/stores/useAppStore";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useGetUser } from "@/hooks/useGetUser";
import { useUserSettings } from "@/hooks/useUserSettings";
import { useMutateUserSettings } from "@/hooks/useMutateUserSettings";
import { useToast } from "@/hooks/useToast";
import { UserSettings } from "@/interfaces/user";
import { PreferencesMobileView } from "../PreferencesMobileView";
import { PreferencesDesktopView } from "../PreferencesDesktopView";

export function PageContent() {
  const isMobile = useIsMobile();
  const { t } = useTranslation(LocaleNamespace.Preferences);
  const { setPageTitle } = useAppStore();
  const { profile } = useGetUser();
  const settings = useUserSettings();
  const { updateSettings } = useMutateUserSettings();
  const { showSuccessToast, showErrorToast } = useToast();

  useEffect(() => {
    setPageTitle(t("preferences", { ns: LocaleNamespace.Common }), t("subtitle"));
  }, [t, setPageTitle]);

  const onUpdate = async (patch: Partial<UserSettings>) => {
    try {
      await updateSettings(patch);
      showSuccessToast({ title: t("preferencesUpdated") });
    } catch {
      showErrorToast({ title: t("preferencesUpdateFailed") });
    }
  };

  const View = isMobile ? PreferencesMobileView : PreferencesDesktopView;

  return (
    <section className="flex flex-col items-center w-full">
      <View profile={profile} settings={settings} onUpdate={onUpdate} />
    </section>
  );
}

export default PageContent;
