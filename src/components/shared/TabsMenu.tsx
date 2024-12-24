import { siteConfig } from "@/config/site";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useTranslation } from "@/i18n/i18nClient";
import { Tabs, Tab } from "@nextui-org/tabs";
import { usePathname } from "next/navigation";

const keyLabel = new Map(
  siteConfig.pages.map((page) => [page.href, page.label])
);

export const TabsMenu: React.FC<object> = ({}) => {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const { t } = useTranslation();

  return (
    <div className="flex w-full flex-col">
      <Tabs
        aria-label="Menu"
        variant="bordered"
        color="primary"
        size={isMobile ? "sm" : "md"}
        fullWidth={isMobile}
        selectedKey={keyLabel.get(pathname)}
      >
        {siteConfig.pages.map((page) => (
          <Tab
            className="h-fit"
            key={page.label}
            id={page.href}
            href={page.href}
            title={
              <div className="flex flex-col md:flex-row items-center md:space-x-2">
                <page.icon className="dark:text-white size-4 md:size-6" />
                <span>{t(page.label)}</span>
              </div>
            }
          />
        ))}
      </Tabs>
    </div>
  );
};
