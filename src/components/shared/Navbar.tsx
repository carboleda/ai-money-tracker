"use client";

import { useAppStore } from "@/stores/useAppStore";
import { Button } from "@heroui/button";
import { CiMenuBurger } from "react-icons/ci";

export const Navbar = () => {
  const { pageTitle, pageSubtitle, toggleSidebar } = useAppStore();

  return (
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

      <div className="flex flex-col w-full">
        <h1 className="lg:hidden">{pageTitle}</h1>
        <h3 className="text-small lg:font-normal font-light dark:text-zinc-400">
          {pageSubtitle}
        </h3>
      </div>
    </div>
  );
};
