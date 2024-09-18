import { Notification } from "firebase-admin/messaging";
import { db, sendMessage } from "@/firebase/server";
import * as UserApi from "@/app/api/user/route";
import { UserEntity } from "@/interfaces/user";
import { TransactionEntity, TransactionStatus } from "@/interfaces/transaction";
import { NextResponse } from "next/server";
import { dateDiffInDays, formatDate } from "@/config/utils";
import { Env } from "@/config/env";

export async function GET() {
  const now = new Date();
  const earlyReminderDate = new Date();
  earlyReminderDate.setDate(now.getDate() + Env.EARLY_REMINDER_DAYS_AHEAD);

  const transactionsRef = db.collection("transactions");
  const snapshot = await transactionsRef
    .where("status", "==", TransactionStatus.PENDING)
    .orderBy("createdAt", "asc")
    .get();

  if (snapshot.empty) {
    console.log("No pending transactions found.");
    return new NextResponse(null, { status: 200 });
  }

  const user = await UserApi.getExistingUser();
  const userData = user?.data() as UserEntity;
  const notifyUser = createNotifier(userData.fcmToken);

  snapshot.docs
    .map((doc) => doc.data() as TransactionEntity)
    .filter((transaction) => {
      const createdAt = transaction.createdAt.toDate();
      return createdAt <= now || earlyReminderDate >= createdAt;
    })
    .forEach((transaction) => notifyUser(transaction));

  return new NextResponse(null, { status: 200 });
}

function createNotifier(fcmToken: string) {
  const now = new Date();
  return (transaction: TransactionEntity) => {
    const notification = getNotification(now, transaction);
    sendMessage(fcmToken, notification);
  };
}

function getNotification(
  now: Date,
  transaction: TransactionEntity
): Notification {
  const createdAt = transaction.createdAt.toDate();

  if (createdAt <= now) {
    const dayDiff = dateDiffInDays(now, createdAt);
    return {
      title: `[ACTION REQUIRED]: Payment due`,
      body: `Payment for ${transaction.description} is due ${dayDiff} ago, pay it ASAP.`,
    };
  }

  return {
    title: `[REMINDER]: Payment will be due soon`,
    body: `Payment for ${transaction.description} is due on ${formatDate(
      createdAt
    )}.`,
  };
}
