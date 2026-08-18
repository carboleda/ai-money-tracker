"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

// The root layout is a Server Component, so it can't call useTheme() to pick
// the initial `<html>` class — it reads a cookie instead. next-themes only
// persists to localStorage, so this mirrors the resolved theme into a cookie
// on every change, keeping the SSR class in sync with the user's actual
// choice and avoiding a flash of the wrong theme on full page loads.
const THEME_COOKIE = "theme";

export function ThemeCookieSync() {
  const { theme } = useTheme();

  useEffect(() => {
    if (!theme) return;
    document.cookie = `${THEME_COOKIE}=${theme}; path=/; max-age=31536000; samesite=lax`;
  }, [theme]);

  return null;
}
