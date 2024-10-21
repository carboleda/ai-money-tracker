"use client";

import "@/firebase/client/";
import React from "react";
import { Button } from "@nextui-org/button";
import { useRouter } from "next/navigation";
import { auth, provider } from "@/firebase/client/auth";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

function LoginPage() {
  const router = useRouter();

  const handleGoogleLogin = () => {
    signInWithPopup(auth, provider)
      .then(async (result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        // const credential = GoogleAuthProvider.credentialFromResult(result);
        // const token = credential?.idToken;
        const token = await auth.currentUser?.getIdToken(true);
        // The signed-in user info.
        const user = result.user;
        // IdP data available using getAdditionalUserInfo(result)
        // ...

        fetch("/api/login", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).then((_response) => router.push("/"));
      })
      .catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.customData.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);

        console.log({ errorCode, errorMessage, email, credential });
      });
  };

  return (
    <div className="flex flex-col justify-center items-stretch h-full">
      <h1 className="self-center mt-4">Login</h1>
      <div className="flex-grow flex items-center justify-center">
        <Button onClick={handleGoogleLogin}>Sign in with Google</Button>
      </div>
    </div>
  );
}

export default LoginPage;
