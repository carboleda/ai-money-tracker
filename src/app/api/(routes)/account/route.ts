import "reflect-metadata";
import { GetAllAccountsService } from "@/app/api/domain/account/service/get-all.service";
import { NextResponse } from "next/server";
import { api } from "@/app/api/index";

export async function GET() {
  const service = api.resolve(GetAllAccountsService);
  const accounts = await service.execute();

  return NextResponse.json({ accounts });
}
