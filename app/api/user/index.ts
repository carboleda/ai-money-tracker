import { Collections, db } from "@/firebase/server";
import { QueryDocumentSnapshot } from "firebase-admin/firestore";

export class UserSharedFunctions {
  static async getExistingUser(): Promise<QueryDocumentSnapshot | null> {
    return db
      .collection(Collections.Users)
      .limit(1) // TODO: Use the doc function instead of limit to support multiple users
      .get()
      .then((snapshot) => {
        if (snapshot.docs.length === 0) {
          return null;
        }

        return snapshot.docs[0];
      });
  }
}
