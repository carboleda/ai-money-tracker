import "reflect-metadata";
import { NextRequest, NextResponse } from "next/server";
import { GetUserService } from "@/app/api/domain/user/service/get-user.service";
import { UserModel } from "@/app/api/domain/user/model/user.model";
import { UpsertUserService } from "@/app/api/domain/user/service/upsert-user.service";
import { api } from "@/app/api";
import { withUserContext } from "../../context/initialize-context";

export async function GET(req: NextRequest) {
  return withUserContext(req, async () => {
    const service = api.resolve(GetUserService);
    const user = await service.execute();

    return NextResponse.json({
      user,
    });
  });
}

export async function PUT(req: NextRequest) {
  return withUserContext(req, async () => {
    const service = api.resolve(UpsertUserService);

    const user = (await req.json()) as UserModel;
    const userId = await service.execute(user);

    return NextResponse.json({ id: userId });
  });
}
