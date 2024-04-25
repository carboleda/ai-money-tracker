import { db } from "@/config/firestore";

export async function GET() {
  const snapshot = await db.collection("transactions").get();
  const data = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));

  return Response.json({ data });
}
