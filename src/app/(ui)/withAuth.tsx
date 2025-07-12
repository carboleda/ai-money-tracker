import FcmProvider from "@/components/providers/FcmProvider";
import { Sidebar } from "@/components/shared/Sidebar";
import { firebaseApp } from "@/firebase/client";

type ComponentProps = any;

export function withAuth(Component: React.FC) {
  return function withAuth(props: ComponentProps) {
    return (
      <FcmProvider firebaseApp={firebaseApp}>
        <Sidebar>
          <Component {...props} />
        </Sidebar>
      </FcmProvider>
    );
  };
}
