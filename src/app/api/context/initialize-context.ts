import { NextRequest, NextResponse } from "next/server";
import { runWithUserContext } from "./user-context";

export async function withUserContext(
  req: NextRequest,
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  // Extract user ID from Firebase token
  const email = req.headers.get("X-User-Email");

  if (!email) {
    return NextResponse.json(
      { error: "Unauthorized: No valid user email found" },
      { status: 401 }
    );
  }

  // Run the handler within the user context
  return runWithUserContext(email, handler);
}
