import { Env } from "@/config/env";
import { Notification } from "firebase-admin/messaging";
import { db, sendMessage } from "@/firebase/server";
import { UserSharedFunctions } from "@/app/api/user";
import { UserEntity } from "@/interfaces/user";
import { TransactionEntity, TransactionStatus } from "@/interfaces/transaction";
import { NextRequest, NextResponse } from "next/server";
import { dateDiffInDays, formatDate } from "@/config/utils";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");

  if (
    !Env.isDev &&
    (!Env.CRON_SECRET || authHeader !== `Bearer ${Env.CRON_SECRET}`)
  ) {
    console.error("Unauthorized request");
    return new NextResponse(JSON.stringify({ success: false }), {
      status: 401,
    });
  }

  const now = new Date();
  const earlyReminderDate = new Date();
  earlyReminderDate.setDate(now.getDate() + Env.EARLY_REMINDER_DAYS_AHEAD);

  console.log(`Fetching pending transactions...`);
  const transactionsRef = db.collection("transactions");
  const snapshot = await transactionsRef
    .where("status", "==", TransactionStatus.PENDING)
    .orderBy("createdAt", "asc")
    .get();

  if (snapshot.empty) {
    console.log("No pending transactions found.");
    return new NextResponse(null, { status: 200 });
  }
  console.log(`Found ${snapshot.docs.length} transactions`);

  const user = await UserSharedFunctions.getExistingUser();
  const userData = user?.data() as UserEntity;
  const notifyUser = createNotifier(userData.fcmToken);
  console.log(`Will send notifications to user ${user?.id}`, userData);

  const transactions = snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() } as TransactionEntity))
    .filter((transaction) => {
      const createdAt = transaction.createdAt.toDate();
      return createdAt <= now || earlyReminderDate >= createdAt;
    });

  if (!transactions.length) {
    console.log("No transactions to notify after applying criterias.", {
      now,
      earlyReminderDate,
    });
    return new NextResponse(null, { status: 200 });
  }

  console.log(
    `Sending notifications for ${transactions.length} transactions...`,
    { transactions }
  );
  const messageIds = await Promise.allSettled(
    transactions.map((transaction) => notifyUser(transaction))
  );
  console.log("Notifications sent", messageIds);

  return NextResponse.json({ success: true, count: transactions.length });
}

function createNotifier(fcmToken: string) {
  const now = new Date();
  return (transaction: TransactionEntity) => {
    const notification = getNotification(now, transaction);
    return sendMessage(fcmToken, {
      notification,
      extraData: {
        transactionId: transaction.id!,
      },
    });
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
      body: `Payment for ${transaction.description} is due ${dayDiff} days ago, pay it ASAP.`,
    };
  }

  return {
    title: `[REMINDER]: Payment will be due soon`,
    body: `Payment for ${transaction.description} is due on ${formatDate(
      createdAt
    )}.`,
  };
}
