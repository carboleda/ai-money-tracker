import { db } from "@/firebase/server";
import * as UserApi from "@/app/api/user/route";
import { UserEntity } from "@/interfaces/user";
import { TransactionEntity, TransactionStatus } from "@/interfaces/transaction";
import { NextResponse } from "next/server";

export async function GET() {
  const now = new Date();
  const upcomingNotificationDate = new Date();
  upcomingNotificationDate.setDate(now.getDate() + 3); // FIXME: Create environment variable for notification days

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
      return createdAt <= now || upcomingNotificationDate >= createdAt;
    })
    .forEach((transaction) => notifyUser(transaction));

  return new NextResponse(null, { status: 200 });
}

function createNotifier(fcmToken: string) {
  return (transaction: TransactionEntity) => {
    // TODO: Create message template
    const createdAt = transaction.createdAt.toDate();
    console.log(
      `Reminder: Pending transaction for ${transaction.description} is due on ${createdAt}.`
    );
  };
}
