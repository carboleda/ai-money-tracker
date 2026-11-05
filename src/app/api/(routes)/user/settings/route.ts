import "reflect-metadata";
import { NextRequest, NextResponse } from "next/server";
import { api } from "@/app/api";
import { withUserContext } from "@/app/api/context/initialize-context";
import { GetUserService } from "@/app/api/domain/user/service/get-user.service";
import { UpdateUserSettingsService } from "@/app/api/domain/user/service/update-user-settings.service";
import { UpdateUserSettingsSchema } from "@/app/api/validators/user.validator";
import { handleApiError } from "@/app/api/helpers/handle-api-error";

export async function GET(req: NextRequest) {
  return withUserContext(req, async () => {
    const service = api.resolve(GetUserService);
    const user = await service.execute();

    return NextResponse.json(user?.settings ?? {});
  });
}

export async function PATCH(req: NextRequest) {
  return withUserContext(req, async () => {
    try {
      const body = await req.json();
      const input = UpdateUserSettingsSchema.parse(body);

      const service = api.resolve(UpdateUserSettingsService);
      const settings = await service.execute(input);

      return NextResponse.json(settings);
    } catch (error) {
      return handleApiError(error);
    }
  });
}
