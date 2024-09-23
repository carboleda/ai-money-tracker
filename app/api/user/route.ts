import { Collections, db } from "@/firebase/server";
import { User, UserEntity } from "@/interfaces/user";
import { NextRequest, NextResponse } from "next/server";
import { UserSharedFunctions } from ".";

export async function PUT(req: NextRequest) {
  const { fcmToken } = (await req.json()) as User;

  const userDoc = await UserSharedFunctions.getExistingUser();

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
