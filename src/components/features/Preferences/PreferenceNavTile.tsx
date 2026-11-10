"use client";

import { Surface } from "@heroui/react";
import { HiChevronRight } from "react-icons/hi";

interface PreferenceNavTileProps {
  icon: React.ReactNode;
  title: string;
  preview: string;
  onClick: () => void;
}

export const PreferenceNavTile: React.FC<PreferenceNavTileProps> = ({
  icon,
  title,
  preview,
  onClick,
}) => {
  return (
    <Surface
      variant="secondary"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className="flex items-center gap-3 w-full p-4 rounded-2xl text-left min-h-11 cursor-pointer"
    >
      {icon}
      <div className="flex flex-col flex-1 min-w-0">
        <span className="font-semibold">{title}</span>
        <span className="text-xs text-muted truncate">{preview}</span>
      </div>
      <HiChevronRight className="text-muted shrink-0" />
    </Surface>
  );
};
