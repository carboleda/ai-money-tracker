"use client";

import { useEffect } from "react";
import i18next, { changeLanguage } from "i18next";
import { useUserSettings } from "@/hooks/useUserSettings";

// The language detector resolves a language from the cookie/navigator
// before the authenticated user is known, so once the backend-persisted
// preference loads it must override that guess everywhere, not just on the
// Preferences page, to keep language consistent across devices/sessions.
export function LanguagePreferenceSync() {
  const settings = useUserSettings();
  const language = settings?.language;

  useEffect(() => {
    if (language && language !== i18next.language) {
      void changeLanguage(language);
    }
  }, [language]);

  return null;
}
