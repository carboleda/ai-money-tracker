import "reflect-metadata";
import { NextRequest, NextResponse } from "next/server";
import { CalculateSummaryService } from "@/app/api/domain/summary/service/calculate-summary.service";
import { api } from "@/app/api";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const startDate = searchParams.get("start");
  const endDate = searchParams.get("end");

  const service = api.resolve(CalculateSummaryService);

  const summary = await service.execute(
    startDate ? new Date(startDate) : undefined,
    endDate ? new Date(endDate) : undefined
  );

  return NextResponse.json(summary);
}
