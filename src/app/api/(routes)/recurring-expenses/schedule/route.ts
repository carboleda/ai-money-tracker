import "reflect-metadata";
import { NextResponse } from "next/server";
import { ScheduleRecurringExpenseForAllUsersService } from "@/app/api/domain/recurring-expense/service/schedule-recurring-expense-for-all-users.service";
import { api } from "@/app/api";

export async function GET() {
  const service = api.resolve(ScheduleRecurringExpenseForAllUsersService);

  const result = await service.execute();

  return NextResponse.json(result);
}
