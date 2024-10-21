import { TabsMenu } from "@/components/shared/TabsMenu";

type ComponentProps = any;

export function withAuth(Component: React.FC) {
  return function (props: ComponentProps) {
    return (
      <div>
        <TabsMenu />
        <div className="pt-2 pb-3">
          <Component {...props} />
        </div>
      </div>
    );
  };
}
