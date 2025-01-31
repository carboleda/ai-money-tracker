import { NextRequest, NextResponse } from "next/server";
import { middlewareChain } from "@/middlewares";

// Define which routes you want to apply this middleware
export const config = {
  matcher: [
    "/",
    "/((?!_next|api|.*\\.).*)",
    "/api/login",
    "/api/logout",
    "/api/transaction",
  ],
};

export default async function middleware(request: NextRequest) {
  for await (const chain of middlewareChain) {
    const response = await chain(request);

    if (response) {
      return response;
    }
  }

  return NextResponse.next();
}
