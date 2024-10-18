import { siteConfig } from "@/config/site";
import { useIsMobile } from "@/hooks/useIsMobile";
import { Tabs, Tab } from "@nextui-org/tabs";
import { usePathname } from "next/navigation";

const keyLabel = new Map(
  siteConfig.pages.map((page) => [page.href, page.label])
);

export const TabsMenu: React.FC<object> = ({}) => {
  const pathname = usePathname();
  const isMobile = useIsMobile();

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
            key={page.label}
            id={page.href}
            href={page.href}
            title={
              <div className="flex items-center space-x-2">
                <page.icon className="dark:text-white size-6" />
                <span>{page.label}</span>
              </div>
            }
          />
        ))}
      </Tabs>
    </div>
  );
};
