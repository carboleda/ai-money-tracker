import { siteConfig } from "@/config/site";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useTranslation } from "react-i18next";
import { Tabs, Tab } from "@heroui/tabs";
import { usePathname } from "next/navigation";

const keyLabel = new Map(
  siteConfig.pages.map((page) => [page.href, page.label])
);

export const SidebarMenuItems: React.FC<object> = ({}) => {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const { t } = useTranslation();

  return (
    <div className="flex w-full flex-col justify-start items-start">
      <Tabs
        aria-label="Menu"
        variant="light"
        isVertical
        color="primary"
        size={isMobile ? "sm" : "md"}
        fullWidth={isMobile}
        selectedKey={keyLabel.get(pathname)}
        classNames={{
          tabWrapper: "w-full",
        }}
      >
        {siteConfig.pages.map((page) => (
          <Tab
            className="h-fit w-full flex !flex-col !justify-start !items-start"
            key={page.label}
            id={page.href}
            href={page.href}
            title={
              <div className="flex !flex-row !items-center !space-x-2 !gap-2">
                <page.icon className="dark:text-white size-8 md:size-6" />
                <span className="text-left w-full">{t(page.label)}</span>
              </div>
            }
          />
        ))}
      </Tabs>
    </div>
  );
};
