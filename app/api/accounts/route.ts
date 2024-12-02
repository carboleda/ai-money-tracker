import { AccountShareFunctions } from "./functions";
import { NextResponse } from "next/server";

export async function GET() {
  const accounts = await AccountShareFunctions.getAllAccounts();

  return NextResponse.json({ accounts });
}
