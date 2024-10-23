import FcmProvider from "@/components/FcmProvider";
import { TabsMenu } from "@/components/shared/TabsMenu";
import { firebaseApp } from "@/firebase/client";

type ComponentProps = any;

export function withAuth(Component: React.FC) {
  return function withAuth(props: ComponentProps) {
    return (
      <FcmProvider firebaseApp={firebaseApp}>
        <div className="pt-2">
          <TabsMenu />
          <div className="pt-2 pb-3">
            <Component {...props} />
          </div>
        </div>
      </FcmProvider>
    );
  };
}
