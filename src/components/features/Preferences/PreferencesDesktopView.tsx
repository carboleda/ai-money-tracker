"use client";

import { UserSettings } from "@/interfaces/user";
import { LogOutButton } from "@/components/shared/Sidebar/LogOutButton";
import { ProfileSection } from "./ProfileSection";
import { GeneralPreferencesSection } from "./GeneralPreferencesSection";
import { NotificationsSection } from "./NotificationsSection";
import { IntegrationsSection } from "./IntegrationsSection";

interface PreferencesDesktopViewProps {
  profile: { name?: string; email?: string; picture?: string } | null;
  settings?: UserSettings;
  onUpdate: (patch: Partial<UserSettings>) => void;
}

export const PreferencesDesktopView: React.FC<PreferencesDesktopViewProps> = ({
  profile,
  settings,
  onUpdate,
}) => {
  return (
    <div className="flex flex-col gap-4 w-full max-w-5xl">
      <ProfileSection profile={profile} />
      <GeneralPreferencesSection settings={settings} onUpdate={onUpdate} />
      <NotificationsSection settings={settings} onUpdate={onUpdate} />
      <IntegrationsSection />
      <LogOutButton />
    </div>
  );
};
