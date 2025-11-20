import "@/styles/globals.css";
import FcmProvider from "@/components/providers/FcmProvider";
import { Sidebar } from "@/components/shared/Sidebar/Sidebar";
import { firebaseApp } from "@/firebase/client";
import { Navbar } from "@/components/shared/Navbar";

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  return (
    <section>
      <FcmProvider firebaseApp={firebaseApp}>
        <Sidebar>
          <Navbar />
          {children}
        </Sidebar>
      </FcmProvider>
    </section>
  );
}
