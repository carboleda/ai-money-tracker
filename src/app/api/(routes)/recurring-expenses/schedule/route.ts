import "reflect-metadata";
import { NextResponse } from "next/server";
import { ScheduleRecurrentExpenseForAllUsersService } from "@/app/api/domain/recurrent-expense/service/schedule-recurrent-expense-for-all-users.service";
import { api } from "@/app/api";

export async function GET() {
  const service = api.resolve(ScheduleRecurrentExpenseForAllUsersService);

  const result = await service.execute();

  return NextResponse.json(result);
}
