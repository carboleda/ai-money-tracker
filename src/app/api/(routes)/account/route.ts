import "reflect-metadata";
import { GetAllAccountsService } from "@/app/api/domain/account/service/get-all.service";
import { NextRequest, NextResponse } from "next/server";
import { api } from "@/app/api/index";
import { withUserContext } from "@/app/api/context/initialize-context";

export async function GET(req: NextRequest) {
  return withUserContext(req, async () => {
    const service = api.resolve(GetAllAccountsService);
    const accounts = await service.execute();

    return NextResponse.json({ accounts });
  });
}
