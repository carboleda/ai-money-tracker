"use client";

import { Button, Card, Surface } from "@heroui/react";
import { useTranslation } from "react-i18next";
import { HiOutlineDownload } from "react-icons/hi";
import { HiOutlinePuzzlePiece } from "react-icons/hi2";
import { FaApplePay } from "react-icons/fa";
import { LocaleNamespace } from "@/i18n/namespace";
import { Env } from "@/config/env";

interface IntegrationsSectionProps {
  hdieTitle?: boolean;
}

export const IntegrationsSection: React.FC<IntegrationsSectionProps> = ({
  hdieTitle = false,
}) => {
  const { t } = useTranslation(LocaleNamespace.Preferences);

  return (
    <div className="flex flex-col gap-2 w-full">
      {!hdieTitle && (
        <div className="flex items-center gap-2 text-foreground font-semibold">
          <HiOutlinePuzzlePiece className="text-2xl" />
          {t("integrations")}
        </div>
      )}

      <Surface
        variant="secondary"
        className="flex flex-col gap-4 w-full p-4 rounded-2xl"
      >
        <Card variant="default">
          <Card.Header className="flex flex-row align-top gap-2">
            <FaApplePay className="text-7xl md:text-4xl" />
            <div>
              <Card.Title className="flex items-center gap-2">
                {t("appleWalletShortcut")}
              </Card.Title>
              <Card.Description>
                {t("appleWalletShortcutHelper")}
              </Card.Description>
            </div>
          </Card.Header>
          <Card.Footer className="flex justify-end">
            <Button
              variant="secondary"
              size="sm"
              onPress={() =>
                window.open(Env.NEXT_PUBLIC_APPLE_SHORTCUT_URL, "_blank")
              }
            >
              <HiOutlineDownload />
              {t("downloadShortcut")}
            </Button>
          </Card.Footer>
        </Card>
      </Surface>
    </div>
  );
};
