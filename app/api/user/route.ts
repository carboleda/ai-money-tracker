import { Collections, db } from "@/firebase/server";
import { User, UserEntity } from "@/interfaces/user";
import { QueryDocumentSnapshot } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
  const { fcmToken } = (await req.json()) as User;

  const userDoc = await getExistingUser();

  if (userDoc) {
    userDoc.ref.update({
      ...(userDoc.data() as UserEntity),
      fcmToken,
    });

    return NextResponse.json({ id: userDoc.id });
  }

  const docRef = await db.collection(Collections.Users).add({ fcmToken });

  return NextResponse.json({ id: docRef.id });
}

async function getExistingUser(): Promise<QueryDocumentSnapshot | null> {
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
