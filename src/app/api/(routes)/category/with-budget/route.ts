import "reflect-metadata";
import { GetAllCategoriesWithBudgetStatusService } from "@/app/api/domain/category/service/get-all-categories-with-budget-status.service";
import { NextRequest, NextResponse } from "next/server";
import { api } from "@/app/api/index";
import { withUserContext } from "@/app/api/context/initialize-context";
import { CategoryWithBudgetStatusOutput } from "@/app/api/domain/category/ports/outbound/get-categories.port";

export async function GET(req: NextRequest) {
  return withUserContext(req, async () => {
    const service = api.resolve(GetAllCategoriesWithBudgetStatusService);
    const categories = await service.execute();

    const output: CategoryWithBudgetStatusOutput[] = categories.map((cat) => ({
      id: cat.id!,
      ref: cat.ref,
      name: cat.name,
      icon: cat.icon,
      color: cat.color,
      type: cat.type,
      description: cat.description,
      budget: cat.budget,
      isCustom: cat.isCustom,
      createdAt: cat.createdAt.toISOString(),
      updatedAt: cat.updatedAt.toISOString(),
    }));

    return NextResponse.json({ categories: output });
  });
}
