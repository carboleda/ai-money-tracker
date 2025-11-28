import "reflect-metadata";
import { NextResponse } from "next/server";
import { ScheduleRecurrentExpenseService } from "@/app/api/domain/recurrent-expense/service/schedule-recurrent-expense.service";
import { api } from "@/app/api";

export async function GET() {
  const service = api.resolve(ScheduleRecurrentExpenseService);

  const result = await service.execute();

  return NextResponse.json({ success: true, ...result });
}
