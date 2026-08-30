"use client";

import { FC } from "react";
import { useTheme } from "next-themes";
import { useIsSSR } from "@react-aria/ssr";
import clsx from "clsx";

import { SunFilledIcon, MoonFilledIcon } from "@/components/shared/icons";

export interface ThemeSwitchProps {
  className?: string;
}

export const ThemeSwitch: FC<ThemeSwitchProps> = ({ className }) => {
  const { theme, setTheme } = useTheme();
  const isSSR = useIsSSR();
  const isLight = theme === "light" || isSSR;

  const onToggle = () => {
    setTheme(isLight ? "dark" : "light");
  };

  return (
    <button
      type="button"
      aria-label={`Switch to ${isLight ? "dark" : "light"} mode`}
      onClick={onToggle}
      className={clsx(
        "px-px flex items-center justify-center text-default-500 transition-opacity hover:opacity-80 cursor-pointer",
        className
      )}
    >
      {isLight && !isSSR ? (
        <MoonFilledIcon size={22} />
      ) : (
        <SunFilledIcon size={22} />
      )}
    </button>
  );
};
