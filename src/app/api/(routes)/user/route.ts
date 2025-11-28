import "reflect-metadata";
import { NextRequest, NextResponse } from "next/server";
import { GetUserService } from "@/app/api/domain/user/service/get-user.service";
import { UpsertFcmTokenService } from "@/app/api/domain/user/service/upsert-fcmtoken.service";
import { api } from "@/app/api";

export async function GET() {
  const service = api.resolve(GetUserService);

  const user = await service.execute();

  return NextResponse.json({
    user,
  });
}

export async function PUT(req: NextRequest) {
  const service = api.resolve(UpsertFcmTokenService);

  const { fcmToken } = (await req.json()) as { fcmToken: string };
  const userId = await service.execute(fcmToken);

  return NextResponse.json({ id: userId });
}
