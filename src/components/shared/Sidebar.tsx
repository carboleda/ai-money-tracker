"use client";

import { useIsMobile } from "@/hooks/useIsMobile";
import { PropsWithChildren, useState } from "react";
import { Image } from "@heroui/image";
import { siteConfig } from "@/config/site";
import { SidebarMenuItems } from "./SidebarMenuItems";
import { CiMenuBurger } from "react-icons/ci";

export type User = {
  name?: string;
  picture?: string;
};

interface SidebarProps extends PropsWithChildren {
  user?: User;
}

export const Sidebar: React.FC<SidebarProps> = ({ user, children }) => {
  const isMobile = useIsMobile();
  const [isSidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      <button
        onClick={() => toggleSidebar()}
        type="button"
        className="inline-flex items-center p-2 mt-2 ms-3 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
      >
        <span className="sr-only">Open sidebar</span>
        <CiMenuBurger className="text-white size-6" />
      </button>

      {/* Backdrop for mobile sidebar */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-40"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar with transition */}
      <div
        className={`fixed top-0 left-0 z-40 w-64 h-screen sm:translate-x-0 transition-transform duration-300 ease-in-out
          ${
            isMobile
              ? isSidebarOpen
                ? "translate-x-0"
                : "-translate-x-full"
              : "translate-x-0"
          }`}
        style={{ willChange: "transform" }}
        aria-label="Sidebar"
        onClick={isMobile ? (e) => e.stopPropagation() : undefined}
      >
        <div id="default-sidebar" className="w-full h-full">
          <div className="h-full px-3 py-4 overflow-y-auto shadow-xl border-r bg-content1 dark:bg-content2 border-gray-200 dark:border-zinc-700">
            <div className="flex w-full justify-start items-center gap-3">
              <Image width={40} alt="App logo" src={siteConfig.icons.logo} />
              <p className="font-bold text-inherit text-lg text-zinc-700 dark:text-zinc-200">
                {siteConfig.name}
              </p>
            </div>
            <ul className="space-y-2 font-medium mt-6">
              <SidebarMenuItems user={user} />
            </ul>
          </div>
        </div>
      </div>

      <div className="p-4 sm:ml-40 sm:-mr-24">{children}</div>
    </>
  );
};
