import "reflect-metadata";
import { Env } from "@/config/env";
import { NextRequest, NextResponse } from "next/server";
import { ScheduleRecurrentExpenseService } from "@/app/api/domain/recurrent-expense/service/schedule-recurrent-expense.service";
import { api } from "@/app/api";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (
    !Env.isLocal &&
    (!Env.CRON_SECRET || authHeader !== `Bearer ${Env.CRON_SECRET}`)
  ) {
    console.error("Unauthorized request");
    return new NextResponse(JSON.stringify({ success: false }), {
      status: 401,
    });
  }

  const service = api.resolve(ScheduleRecurrentExpenseService);

  const result = await service.execute();

  return NextResponse.json({ success: true, ...result });
}
