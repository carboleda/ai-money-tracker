import "reflect-metadata";
import { NextRequest, NextResponse } from "next/server";
import { CalculateSummaryDashboardService } from "@/app/api/domain/summary/service/calculate-summary-dashboard.service";
import { api } from "@/app/api";
import { withUserContext } from "@/app/api/context/initialize-context";

export async function GET(req: NextRequest) {
  return withUserContext(req, async () => {
    const searchParams = req.nextUrl.searchParams;
    const startDate = searchParams.get("start");
    const endDate = searchParams.get("end");

    const service = api.resolve(CalculateSummaryDashboardService);

    const summary = await service.execute(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );

    return NextResponse.json(summary);
  });
}
