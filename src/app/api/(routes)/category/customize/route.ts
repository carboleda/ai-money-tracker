import "reflect-metadata";
import { CustomizeCategoryService } from "@/app/api/domain/category/service/customize-category.service";
import { NextRequest, NextResponse } from "next/server";
import { api } from "@/app/api/index";
import { withUserContext } from "@/app/api/context/initialize-context";
import { CustomizeCategoryInput } from "@/app/api/domain/category/ports/inbound/customize-category.port";
import { handleApiError } from "@/app/api/helpers/handle-api-error";
import { CustomizeCategorySchema } from "@/app/api/validators/category.validator";

export async function POST(req: NextRequest) {
  return withUserContext(req, async () => {
    try {
      const body = await req.json();

      // Validate request body
      const validatedData = CustomizeCategorySchema.parse(body);

      const input: CustomizeCategoryInput = {
        ref: validatedData.ref,
        name: validatedData.name,
        icon: validatedData.icon,
        description: validatedData.description,
        color: validatedData.color,
        budget: validatedData.budget,
      };

      const service = api.resolve(CustomizeCategoryService);
      const id = await service.execute(input);

      return NextResponse.json({ id }, { status: 201 });
    } catch (error) {
      return handleApiError(error);
    }
  });
}
