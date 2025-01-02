import React, { PropsWithChildren, useEffect, useState } from "react";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { HiOutlineSearch } from "react-icons/hi";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";

export interface SearchToolbarProps extends PropsWithChildren {
  filterValue?: string;
  onSearchChange: (value: string) => void;
}

export const SearchToolbar: React.FC<SearchToolbarProps> = ({
  filterValue,
  onSearchChange,
  children,
}) => {
  const { t } = useTranslation(LocaleNamespace.Common);
  const isMobile = useIsMobile();
  const [isInputFocused, setIsInputFocused] = useState(false);
  const width = isInputFocused ? "w-full" : "w-fit";

  const onValueChange = (value: string = "") => {
    onSearchChange(value);
  };

  const onClear = () => {
    onSearchChange("");
  };

  const setFocus = () => {
    setIsInputFocused(true);
  };

  const onClickOutside = () => {
    setTimeout(() => {
      setIsInputFocused(false);
    }, 200);
  };

  useEffect(() => {
    setIsInputFocused(isMobile ? false : true);
  }, [isMobile]);

  return (
    <>
      <div
        className={`${width} h-full flex items-center gap-2`}
        onBlur={onClickOutside}
      >
        {isMobile && !isInputFocused && (
          <Button
            variant="flat"
            size="md"
            className="h-14 w-fit md:w-fit justify-start py-6 px-3 rounded-xl"
            onPress={setFocus}
            isIconOnly
          >
            <HiOutlineSearch className="text-lg" />
          </Button>
        )}
        {(isInputFocused || !isMobile) && (
          <Input
            radius="md"
            variant="bordered"
            className="w-fit"
            classNames={{ inputWrapper: "py-6" }}
            placeholder={t("searchByDescription")}
            startContent={<HiOutlineSearch />}
            value={filterValue}
            onClear={onClear}
            onValueChange={onValueChange}
            autoFocus
            isClearable
          />
        )}
      </div>
      <div className={!isMobile || !isInputFocused ? "flex gap-2" : "hidden"}>
        {children}
      </div>
    </>
  );
};
