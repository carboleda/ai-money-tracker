"use client";

import { useTranslation } from "react-i18next";
import { Link } from "@nextui-org/link";

export const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="w-full flex items-center justify-center pb-2 gap-4">
      <Link
        isExternal
        className="flex items-center gap-1 text-xs"
        href="https://carlosarboleda.co"
        title="carlosarboleda.co"
      >
        <span className="text-default-600">{t("developedBy")}</span>
        <p className="text-primary">Carlos Arboleda</p>
      </Link>
      <span> | </span>
      <Link
        isExternal
        className="flex items-center gap-1 text-xs"
        href="https://nextui-docs-v2.vercel.app?utm_source=next-app-template"
        title="nextui.org homepage"
      >
        <span className="text-default-600">{t("poweredBy")}</span>
        <p className="text-primary">NextUI</p>
      </Link>
    </footer>
  );
};
