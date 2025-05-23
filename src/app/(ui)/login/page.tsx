"use client";

import "@/firebase/client/";
import React, { useTransition } from "react";
import { Button } from "@heroui/button";
import { useRouter } from "next/navigation";
import { auth, provider } from "@/firebase/client/auth";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { FcGoogle } from "react-icons/fc";
import { FirebaseError } from "firebase/app";
import { Code } from "@heroui/code";
import { Image } from "@heroui/image";
import { siteConfig } from "@/config/site";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";

function LoginPage() {
  const [errorMessage, setErrorMessage] = React.useState("");
  const router = useRouter();
  const [_, startTransition] = useTransition();
  const { t } = useTranslation(LocaleNamespace.Login);

  const onGoogleLogin = async () => {
    try {
      setErrorMessage("");
      const result = await signInWithPopup(auth, provider);
      const token = await auth.currentUser?.getIdToken(true);
      // IdP data available using getAdditionalUserInfo(result)

      await fetch("/api/login", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      router.push("/");
      startTransition(() => {
        // Refresh the current route and fetch new data from the server without
        // losing client-side browser or React state.
        router.refresh();
      });
    } catch (error) {
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
      }

      setErrorMessage(t("signInErrorMessage"));
    }
  };

  return (
    <div className="flex flex-col h-full justify-center items-center">
      <div className="flex flex-col items-center w-full max-w-md p-8 dark:bg-zinc-900 shadow-lg rounded-lg">
        <div className="flex justify-center items-center gap-3 pb-4">
          <Image width={40} alt="App logo" src={siteConfig.icons.logo} />
          <h1 className="text-2xl font-bold text-center">{t("title")}</h1>
        </div>
        <h4 className="text-zinc-400">{t("subtitle")}</h4>

        <div className="flex flex-col gap-5 justify-center items-center mt-20">
          <Button
            onPress={onGoogleLogin}
            variant="flat"
            color="primary"
            className="w-fit"
          >
            <FcGoogle size={20} />
            {t("signInWithButton")}
          </Button>

          {errorMessage && (
            <Code color="danger" className="text-center">
              {errorMessage}
            </Code>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
