"use client";

import "@/firebase/client/";
import React from "react";
import { Button } from "@nextui-org/button";
import { useRouter } from "next/navigation";
import { auth, provider } from "@/firebase/client/auth";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { FcGoogle } from "react-icons/fc";
import { FirebaseError } from "firebase/app";

function LoginPage() {
  const router = useRouter();

  const onGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const token = await auth.currentUser?.getIdToken(true);
      // IdP data available using getAdditionalUserInfo(result)

      await fetch("/api/login", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      router.push("/");
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

      console.log("Error", { error });
    }
  };

  return (
    <div className="flex flex-col h-full justify-center items-center">
      <div className="w-full max-w-md p-8 dark:bg-zinc-900 shadow-lg rounded-lg">
        <h1 className="text-2xl font-bold text-center mb-10">Sign In</h1>
        <div className="flex justify-center">
          <Button onClick={onGoogleLogin} variant="flat" color="primary">
            <FcGoogle size={20} />
            Sign in with Google
          </Button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
