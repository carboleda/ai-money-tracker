"use client";

import { PropsWithChildren, useEffect, useState } from "react";
import { Image } from "@heroui/image";
import { siteConfig } from "@/config/site";
import { IconWrapper, SidebarMenuItems } from "./SidebarMenuItems";
import { useAppStore } from "@/stores/useAppStore";
import { HiArrowRightEndOnRectangle } from "react-icons/hi2";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";
import { Divider } from "@heroui/divider";
import { Button } from "@heroui/button";
import { LogOutButton } from "./LogOutButton";
import { ThemeSwitch } from "../ThemeSwitch";

interface SidebarProps extends PropsWithChildren {}

export const Sidebar: React.FC<SidebarProps> = ({ children }) => {
  const { t } = useTranslation(LocaleNamespace.Login);
  const [showSidebar, setShowSidebar] = useState(false);
  const { isSidebarOpen, setIsSidebarOpen } = useAppStore();

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
        <div
          className="fixed inset-0 z-30 bg-black opacity-80"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar with transition */}
      <div
        className={`fixed top-0 left-0 z-40 w-64 h-screen sm:translate-x-0 transition-transform duration-300 ease-in-out
          ${showSidebar ? "translate-x-0" : "-translate-x-full"}`}
        style={{ willChange: "transform" }}
        aria-label="Sidebar"
        onClick={(e) => showSidebar && e.stopPropagation()}
      >
        <div id="default-sidebar" className="w-full h-full">
          <div className="flex flex-col h-full px-3 py-4 overflow-y-auto shadow-xl border-r bg-content1 dark:bg-content1 border-gray-200 dark:border-zinc-700">
            <div className="flex w-full justify-start items-end gap-3">
              <Image
                width={40}
                className="rounded-xs"
                alt="App logo"
                src={siteConfig.icons.logo}
              />
              <p className="font-bold text-inherit text-lg dark:text-zinc-200">
                {siteConfig.name}
              </p>
            </div>
            <div className="flex flex-col h-full space-y-2 font-medium mt-6">
              <SidebarMenuItems onItemClick={() => setIsSidebarOpen(false)} />
              <div className="gap-2 mt-auto">
                <Divider className="my-2" />
                <LogOutButton />
                <div className="flex flex-row gap-2 justify-between m-4">
                  <span className="text-small font-semibold">Theme</span>
                  <ThemeSwitch />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* <div className="p-4 sm:ml-40 sm:-mr-24">{children}</div> */}
      <div className="sm:p-4 sm:ml-48 sm:-mr-24 md:ml-60 md:-mr-2 7xl:ml-40 7xl:-mr-24">
        {children}
      </div>
    </>
  );
};
