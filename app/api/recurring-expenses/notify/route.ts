import { db } from "@/firebase/server"; // Adjust the import according to your project structure

async function notifyPendingTransactions() {
  const now = new Date();
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(now.getDate() + 3);

  const transactionsRef = db.collection("transactions");
  const snapshot = await transactionsRef
    .where("dueDate", ">=", now)
    .where("dueDate", "<=", threeDaysFromNow)
    .get();

  if (snapshot.empty) {
    console.log("No pending transactions found.");
    return;
  }

  snapshot.forEach((doc) => {
    const transaction = doc.data();
    if (!transaction.isComplete) {
      notifyUser(transaction);
    }
  });
}

function notifyUser(transaction: any) {
  // Implement your notification logic here
  console.log(
    `Reminder: Pending transaction for ${transaction.description} is due soon.`
  );
}
