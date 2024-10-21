import { getAuth, GoogleAuthProvider } from "firebase/auth";

export const provider = new GoogleAuthProvider();
provider.addScope("https://www.googleapis.com/auth/contacts.readonly");
provider.setCustomParameters({
  login_hint: "user@example.com",
});

export const auth = getAuth();
