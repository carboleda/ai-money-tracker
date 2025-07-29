"use client";

import { ThemeSwitch } from "@/components/shared/ThemeSwitch";
import { useAppStore } from "@/stores/useAppStore";
import { Button } from "@heroui/button";
import { CiMenuBurger } from "react-icons/ci";

export const Navbar = () => {
  const { pageTitle, toggleSidebar } = useAppStore();

  return (
    <div className="flex flex-col w-full justify-between items-center">
      <div className="flex flex-row justify-between items-center w-full gap-2 mb-4">
        <Button
          isIconOnly
          aria-label="Menu"
          color="default"
          variant="light"
          radius="sm"
          className="sm:hidden"
          onPress={() => toggleSidebar()}
        >
          <CiMenuBurger className="size-6" />
        </Button>

        <h1 className="flex w-full page-title">{pageTitle}</h1>

        <div className="flex items-center sm:hidden pl-4 justify-end gap-2">
          <ThemeSwitch />
        </div>
      </div>
    </div>
  );
};
