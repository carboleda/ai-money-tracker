import "reflect-metadata";
import { NextResponse } from "next/server";
import { ExecuteCronjobForAllUsersService } from "@/app/api/domain/cronjob/service/execute-cronjob-for-all-users.service";
import { api } from "@/app/api";

export async function GET() {
  const service = api.resolve(ExecuteCronjobForAllUsersService);

  const result = await service.execute();

  return NextResponse.json(result);
}
