"use client";

import "@/firebase/client/";
import React, { useTransition } from "react";
import { Button } from "@heroui/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { auth, provider } from "@/firebase/client/auth";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { FaGoogle } from "react-icons/fa";
import { HiChartPie } from "react-icons/hi2";
import { MdAccountBalance } from "react-icons/md";
import { FirebaseError } from "firebase/app";
import { siteConfig } from "@/config/site";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";
import { DeviceInfo } from "@/config/deviceInfo";
import { useMutateUser } from "@/hooks/useMutateUser";
import { ThemeSwitch } from "@/components/shared/ThemeSwitch";
import clsx from "clsx";

const BUDGET_USED_RATIO = 0.72;
const BUDGET_RING_RADIUS = 20;
const BUDGET_RING_CIRCUMFERENCE = 2 * Math.PI * BUDGET_RING_RADIUS;

type TranslateFn = (key: string) => string;

interface CardProps {
  t: TranslateFn;
  className?: string;
}

function SpendingCard({ t, className }: Readonly<CardProps>) {
  return (
    <div
      className={clsx(
        "rounded-2xl bg-surface/90 p-4 shadow-xl backdrop-blur-md",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted">
          {t("heroCard.spendingLabel")}
        </span>
        <HiChartPie className="text-accent" size={18} />
      </div>
      <p className="mt-1 text-2xl font-bold text-foreground">$1,284.50</p>
      <div className="mt-3 flex h-12 items-end gap-1.5">
        {[40, 65, 35, 80, 55, 95, 60].map((height, index) => (
          <div
            key={index}
            className="flex-1 rounded-sm bg-accent/70"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
    </div>
  );
}

function BudgetRingCard({ t, className }: Readonly<CardProps>) {
  return (
    <div
      className={clsx(
        "rounded-2xl bg-surface/90 p-4 shadow-xl backdrop-blur-md",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <svg
          width="48"
          height="48"
          viewBox="0 0 48 48"
          className="shrink-0 -rotate-90"
        >
          <circle
            cx="24"
            cy="24"
            r={BUDGET_RING_RADIUS}
            fill="none"
            stroke="var(--surface-tertiary)"
            strokeWidth="6"
          />
          <circle
            cx="24"
            cy="24"
            r={BUDGET_RING_RADIUS}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={BUDGET_RING_CIRCUMFERENCE}
            strokeDashoffset={
              BUDGET_RING_CIRCUMFERENCE * (1 - BUDGET_USED_RATIO)
            }
          />
        </svg>
        <div>
          <p className="text-xs text-muted">{t("heroCard.budgetLabel")}</p>
          <p className="text-sm font-semibold text-foreground">
            {BUDGET_USED_RATIO * 100}%
          </p>
        </div>
      </div>
    </div>
  );
}

function TransactionCard({ t, className }: Readonly<CardProps>) {
  return (
    <div
      className={clsx(
        "rounded-2xl bg-surface/90 p-4 shadow-xl backdrop-blur-md",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
          <MdAccountBalance size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">
            {t("heroCard.transactionLabel")}
          </p>
          <p className="text-xs text-muted">{t("heroCard.transactionDate")}</p>
        </div>
        <span className="shrink-0 text-sm font-semibold text-success">
          +$2,450
        </span>
      </div>
    </div>
  );
}

function LoginPage() {
  const [errorMessage, setErrorMessage] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();
  const [_, startTransition] = useTransition();
  const { t } = useTranslation(LocaleNamespace.Login);
  const { updateUser } = useMutateUser();

  const onGoogleLogin = async () => {
    try {
      setErrorMessage("");
      setIsLoading(true);
      await signInWithPopup(auth, provider);
      const token = await auth.currentUser?.getIdToken(true);
      // IdP data available using getAdditionalUserInfo(result)

      await fetch("/api/login", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      await onLoginSucess();
    } catch (error) {
      onLoginError(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const onLoginSucess = async () => {
    const { deviceId, deviceName } = await DeviceInfo.generate();
    await updateUser({
      devices: [{ deviceId, deviceName }],
    });

    // This forces the navigation to be updated immediately since the actionl redirection happens in the server
    router.push("/private");
    startTransition(() => {
      // Refresh the current route and fetch new data from the server without
      // losing client-side browser or React state.
      router.refresh();
    });
  };

  const onLoginError = (error: Error) => {
    if (error instanceof FirebaseError) {
      const errorCode = error.code;
      const errorMessage = error.message;
      const email = error.customData?.email;
      const credential = GoogleAuthProvider.credentialFromError(error);

      console.log("FirebaseError", {
        errorCode,
        errorMessage,
        email,
        credential,
      });
    } else {
      console.error("Unexpected error", error);
    }

    setErrorMessage(t("signInErrorMessage"));
  };

  return (
    <div className="relative -mx-2 flex min-h-dvh flex-col md:-mx-4 md:flex-row">
      <ThemeSwitch className="fixed right-4 top-4 z-20 p-2 text-foreground backdrop-blur-sm" />

      {/* Mobile-only decorative card, fills the free space above the form */}
      <div
        aria-hidden="true"
        className="relative flex flex-1 items-center justify-center px-6 pt-8 md:hidden"
      >
        <SpendingCard t={t} className="relative w-52 -rotate-6 opacity-30" />
      </div>

      {/* Form panel */}
      <div className="flex w-full flex-col items-center justify-center px-6 py-8 sm:px-10 md:w-1/2 md:px-14 md:py-16">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3">
            <Image
              width={36}
              height={36}
              alt="App logo"
              loading="eager"
              src={siteConfig.icons.logo}
            />
            <span className="text-lg font-bold text-foreground">
              {siteConfig.name}
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t("welcomeTitle")}
          </h1>
          <p className="mt-3 text-muted">{t("welcomeSubtitle")}</p>

          <div className="mt-10 flex flex-col gap-4">
            <Button
              onPress={onGoogleLogin}
              isPending={isLoading}
              isDisabled={isLoading}
              variant="primary"
              size="lg"
              fullWidth
              className="gap-3"
            >
              {!isLoading && <FaGoogle size={22} />}
              {isLoading ? t("signInWithButtonLoging") : t("signInWithButton")}
            </Button>

            {errorMessage && (
              <div
                role="alert"
                className="rounded-lg bg-danger/10 px-4 py-3 text-center text-sm text-danger"
              >
                {errorMessage}
              </div>
            )}

            <p className="text-center text-xs text-muted">
              {t("signInHelper")}
            </p>
          </div>
        </div>
      </div>

      {/* Mobile-only decorative card, fills the free space below the form */}
      <div
        aria-hidden="true"
        className="relative flex flex-1 items-center justify-center px-6 pb-16 md:hidden"
      >
        <TransactionCard t={t} className="relative w-64 rotate-3 opacity-30" />
      </div>

      {/* Visual panel (desktop only) */}
      <div
        aria-hidden="true"
        className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-linear-to-br from-accent via-accent to-success/80 p-10 md:flex"
      >
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/15 blur-3xl" />
        <div className="absolute -left-16 bottom-0 h-64 w-64 rounded-full bg-black/10 blur-3xl" />

        <div className="relative flex-1">
          <SpendingCard
            t={t}
            className="absolute left-0 top-6 w-56 -rotate-6"
          />
          <BudgetRingCard
            t={t}
            className="absolute right-0 top-36 w-44 rotate-6"
          />
          <TransactionCard
            t={t}
            className="absolute bottom-10 left-6 w-64 rotate-3"
          />
        </div>

        <div className="relative mt-6">
          <h2 className="text-2xl font-bold leading-snug text-accent-foreground">
            {t("heroTitle")}
          </h2>
          <p className="mt-2 text-sm text-accent-foreground/80">
            {t("heroSubtitle")}
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
