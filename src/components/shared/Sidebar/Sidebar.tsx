"use client";

import { PropsWithChildren, useEffect, useState } from "react";
import Image from "next/image";
import { siteConfig } from "@/config/site";
import { SidebarMenuItems } from "./SidebarMenuItems";
import { useAppStore } from "@/stores/useAppStore";
import { Button, Separator } from "@heroui/react";
import { LogOutButton } from "./LogOutButton";
import { ThemeSwitch } from "../ThemeSwitch";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { HiChevronDoubleLeft } from "react-icons/hi2";
import clsx from "clsx";

const EASE = "ease-[cubic-bezier(0.22,1,0.36,1)]";

interface SidebarProps extends PropsWithChildren {}

export const Sidebar: React.FC<SidebarProps> = ({ children }) => {
  const [showSidebar, setShowSidebar] = useState(false);
  const { isSidebarOpen, setIsSidebarOpen } = useAppStore();
  const [isCollapsed, setIsCollapsed] = useLocalStorage<boolean>(
    "sidebarCollapsed",
    false,
  );

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    setShowSidebar(isSidebarOpen);
  }, [isSidebarOpen]);

  return (
    <>
      {/* Backdrop for mobile sidebar */}
      {showSidebar && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-30 bg-black opacity-80"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar with transition */}
      <div
        className={clsx(
          "fixed left-0 inset-y-0 z-40 w-64 transition-all duration-300",
          EASE,
          "md:translate-x-0",
          isCollapsed ? "md:w-20" : "md:w-64",
          showSidebar ? "translate-x-0" : "-translate-x-full",
        )}
        style={{ willChange: "transform" }}
        aria-label="Sidebar"
        onClick={(e) => showSidebar && e.stopPropagation()}
      >
        <div id="default-sidebar" className="w-full h-full">
          <div className="flex flex-col h-full px-3 py-4 overflow-y-auto shadow-xl border-r bg-surface dark:bg-surface border-gray-200 dark:border-zinc-700">
            <div
              className={clsx(
                "flex w-full items-center gap-3",
                isCollapsed
                  ? "md:justify-center md:gap-0"
                  : "justify-start pl-3",
              )}
            >
              <Image
                width={40}
                height={40}
                className="rounded-xs"
                alt="App logo"
                src={siteConfig.icons.logo}
              />
              <p
                className={clsx(
                  "font-bold text-inherit text-lg dark:text-zinc-200 overflow-hidden whitespace-nowrap transition-all duration-300",
                  EASE,
                  isCollapsed
                    ? "md:max-w-0 md:opacity-0"
                    : "md:max-w-40 md:opacity-100",
                )}
              >
                {siteConfig.name}
              </p>
            </div>
            <div className="flex flex-col h-full space-y-2 font-medium mt-6">
              <SidebarMenuItems
                onItemClick={() => setIsSidebarOpen(false)}
                collapsed={isCollapsed}
              />
              <div className="gap-2 mt-auto">
                <Separator className="my-2" />
                <LogOutButton collapsed={isCollapsed} />
                <div
                  className={clsx(
                    "flex flex-row gap-2 m-4",
                    isCollapsed
                      ? "md:justify-center md:gap-0"
                      : "justify-between",
                  )}
                >
                  <span
                    className={clsx(
                      "text-sm font-semibold overflow-hidden whitespace-nowrap transition-all duration-300",
                      EASE,
                      isCollapsed
                        ? "md:max-w-0 md:opacity-0"
                        : "md:max-w-40 md:opacity-100",
                    )}
                  >
                    Theme
                  </span>
                  <ThemeSwitch />
                </div>
              </div>
            </div>
          </div>
        </div>

        <Button
          isIconOnly
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          variant="ghost"
          className="absolute top-1/12 right-0 z-50 hidden size-7 min-w-7 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full border border-gray-200 bg-surface p-0 shadow-md md:flex dark:border-zinc-700"
          onPress={() => setIsCollapsed(!isCollapsed)}
        >
          <HiChevronDoubleLeft
            className={clsx(
              "size-3 transition-transform duration-300",
              EASE,
              isCollapsed && "rotate-180",
            )}
          />
        </Button>
      </div>

      <div
        className={clsx(
          "md:p-4 transition-[margin] duration-300",
          EASE,
          isCollapsed ? "md:ml-20" : "md:ml-64",
        )}
      >
        {children}
      </div>
    </>
  );
};
