import "reflect-metadata";
import { z } from "zod";
import { GetAllCategoriesService } from "@/app/api/domain/category/service/get-all-categories.service";
import { CreateCategoryService } from "@/app/api/domain/category/service/create-category.service";
import { UpdateCategoryService } from "@/app/api/domain/category/service/update-category.service";
import { DeleteCategoryService } from "@/app/api/domain/category/service/delete-category.service";
import { ValidateBudgetService } from "@/app/api/domain/category/service/validate-budget.service";
import { NextRequest, NextResponse } from "next/server";
import { api } from "@/app/api/index";
import { withUserContext } from "@/app/api/context/initialize-context";
import { CreateCategoryInput } from "@/app/api/domain/category/ports/inbound/create-category.port";
import { UpdateCategoryInput } from "@/app/api/domain/category/ports/inbound/update-category.port";
import { DomainError } from "@/app/api/domain/shared/errors/domain.error";
import {
  CreateCategorySchema,
  UpdateCategorySchema,
  DeleteCategorySchema,
} from "@/app/api/validators/category.validator";
import { CategoryOutput } from "@/app/api/domain/category/ports/outbound/get-categories.port";

export async function GET(req: NextRequest) {
  return withUserContext(req, async () => {
    const service = api.resolve(GetAllCategoriesService);
    const categories = await service.execute();

    const output: CategoryOutput[] = categories.map((cat) => ({
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

export async function POST(req: NextRequest) {
  return withUserContext(req, async () => {
    try {
      const body = await req.json();

      // Validate request body
      const validatedData = CreateCategorySchema.parse(body);

      // Validate budget constraints
      const validateBudgetService = api.resolve(ValidateBudgetService);
      await validateBudgetService.execute({
        budget: validatedData.budget,
        categoryType: validatedData.type,
      });

      const input: CreateCategoryInput = {
        name: validatedData.name,
        icon: validatedData.icon,
        type: validatedData.type,
        description: validatedData.description,
        color: validatedData.color,
        budget: validatedData.budget,
      };

      const service = api.resolve(CreateCategoryService);
      const id = await service.execute(input);

      return NextResponse.json({ id }, { status: 201 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            error: "Validation failed",
            details: error.issues,
          },
          { status: 400 }
        );
      }

      const domainError = error as DomainError<unknown>;
      return new NextResponse(null, {
        status: domainError.statusCode,
        statusText: domainError.message,
      });
    }
  });
}

export async function PUT(req: NextRequest) {
  return withUserContext(req, async () => {
    try {
      const body = await req.json();

      // Validate request body
      const validatedData = UpdateCategorySchema.parse(body);

      // Validate budget constraints if budget is provided
      if (validatedData.budget) {
        const validateBudgetService = api.resolve(ValidateBudgetService);
        await validateBudgetService.execute({
          budget: validatedData.budget,
          // Note: We don't have type info in update, so budget validation is done in service layer
        });
      }

      const input: UpdateCategoryInput = {
        id: validatedData.id,
        name: validatedData.name,
        icon: validatedData.icon,
        description: validatedData.description,
        color: validatedData.color,
        budget: validatedData.budget,
      };

      const service = api.resolve(UpdateCategoryService);
      await service.execute(input);

      return NextResponse.json({ id: input.id });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            error: "Validation failed",
            details: error.issues,
          },
          { status: 400 }
        );
      }

      const domainError = error as DomainError<unknown>;
      return new NextResponse(null, {
        status: domainError.statusCode,
        statusText: domainError.message,
      });
    }
  });
}

export async function DELETE(req: NextRequest, res: NextResponse) {
  return withUserContext(req, async () => {
    try {
      const id = await req.text();

      // Validate request body
      const validatedData = DeleteCategorySchema.parse({ id });

      const service = api.resolve(DeleteCategoryService);
      await service.execute(validatedData.id);

      return NextResponse.json(null, {
        status: 200,
        statusText: "Category deleted successfully",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            error: "Validation failed",
            details: error.issues,
          },
          { status: 400 }
        );
      }

      const domainError = error as DomainError<unknown>;
      return new NextResponse(null, {
        status: domainError.statusCode,
        statusText: domainError.message,
      });
    }
  });
}
