"use client";

import { Avatar, Chip, Surface } from "@heroui/react";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";
import { Env } from "@/config/env";

interface ProfileSectionProps {
  profile: { name?: string; email?: string; picture?: string } | null;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({ profile }) => {
  const { t } = useTranslation(LocaleNamespace.Preferences);
  const src = Env.isLocal ? undefined : profile?.picture;
  const initials = profile?.name?.charAt(0) || "U";

  return (
    <Surface
      variant="secondary"
      className="flex items-center gap-4 w-full p-4 rounded-2xl"
    >
      <Avatar className="w-16 h-16 ring-2 ring-background shrink-0">
        {src && <Avatar.Image src={src} alt={profile?.name ?? "User"} />}
        <Avatar.Fallback className="bg-success/20 text-success text-xl">
          {initials}
        </Avatar.Fallback>
      </Avatar>
      <div className="flex flex-col gap-1 min-w-0">
        <span className="font-semibold truncate">{profile?.name}</span>
        <span className="text-sm text-muted truncate">{profile?.email}</span>
        <Chip
          color="default"
          size="sm"
          variant="tertiary"
          className="w-fit mt-1 pl-0"
        >
          {t("managedByGoogle")}
        </Chip>
      </div>
    </Surface>
  );
};
