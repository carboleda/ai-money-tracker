import { Collections, db } from "@/firebase/server";
import { User, UserEntity } from "@/interfaces/user";
import { DocumentData } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
  const { fcmToken } = (await req.json()) as User;

  const userData = await getExistingUser();

  if (userData) {
    userData.update({
      ...userData,
      fcmToken,
    });

    return NextResponse.json({ id: userData.id });
  }

  const docRef = await db.collection(Collections.Users).add({ fcmToken });

  return NextResponse.json({ id: docRef.id });
}

async function getExistingUser(): Promise<(UserEntity & DocumentData) | null> {
  return db
    .collection(Collections.Users)
    .limit(1) // TODO: Use the doc function instead of limit to support multiple users
    .get()
    .then((snapshot) => {
      if (snapshot.docs.length === 0) {
        return null;
      }

      const doc = snapshot.docs[0];

      return {
        ...(doc.data() as UserEntity),
        id: doc.id,
      } as UserEntity & DocumentData;
    });
}
