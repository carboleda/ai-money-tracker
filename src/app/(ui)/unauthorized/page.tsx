"use client";

import { LocaleNamespace } from "@/i18n/namespace";
import { Button } from "@nextui-org/button";
import { Divider } from "@nextui-org/divider";
import { Link } from "@nextui-org/link";
import { useTranslation } from "react-i18next";
import { RiForbidLine } from "react-icons/ri";

function UnauthorizedPage() {
  const { t } = useTranslation(LocaleNamespace.Login);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <div className="flex h-12 items-center gap-4 mb-4">
        <h1 className="text-4xl font-bold">
          <RiForbidLine className="text-red-400" />
        </h1>
        <Divider orientation="vertical" />
        <h1 className="text-4xl font-bold">{t("unauthorized")}</h1>
      </div>

      <p className="text-lg subtitle">{t("unauthorizedMessage.message")}</p>
      <p className="text-lg subtitle mb-8">{t("unauthorizedMessage.advice")}</p>

      <Button as={Link} href="/" color="primary">
        {t("takeMeOut")}
      </Button>
    </main>
  );
}

export default UnauthorizedPage;
