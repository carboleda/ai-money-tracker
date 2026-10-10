import "reflect-metadata";
import { NextRequest, NextResponse } from "next/server";
import { GetAllRecurringExpensesService } from "@/app/api/domain/recurring-expense/service/get-all-recurring-expenses.service";
import { CreateRecurringExpenseService } from "@/app/api/domain/recurring-expense/service/create-recurring-expense.service";
import { UpdateRecurringExpenseService } from "@/app/api/domain/recurring-expense/service/update-recurring-expense.service";
import { DeleteRecurringExpenseService } from "@/app/api/domain/recurring-expense/service/delete-recurring-expense.service";
import type { CreateRecurringExpenseInput } from "@/app/api/domain/recurring-expense/ports/inbound/create-recurring-expense.port";
import type { UpdateRecurringExpenseInput } from "@/app/api/domain/recurring-expense/ports/inbound/update-recurring-expense.port";
import { handleApiError } from "@/app/api/helpers/handle-api-error";
import { api } from "@/app/api";
import { withUserContext } from "@/app/api/context/initialize-context";

export async function GET(req: NextRequest) {
  return withUserContext(req, async () => {
    const service = api.resolve(GetAllRecurringExpensesService);

    try {
      const result = await service.execute();
      return NextResponse.json(result);
    } catch (error) {
      return handleApiError(error);
    }
  });
}

export async function POST(req: NextRequest) {
  return withUserContext(req, async () => {
    const service = api.resolve(CreateRecurringExpenseService);

    try {
      const body = (await req.json()) as CreateRecurringExpenseInput;
      const input: CreateRecurringExpenseInput = {
        ...body,
        dueDate: new Date(body.dueDate),
      };
      const id = await service.execute(input);

      return NextResponse.json({ id });
    } catch (error) {
      return handleApiError(error);
    }
  });
}

export async function PUT(req: NextRequest) {
  return withUserContext(req, async () => {
    const service = api.resolve(UpdateRecurringExpenseService);

    try {
      const body = (await req.json()) as UpdateRecurringExpenseInput;
      const input: UpdateRecurringExpenseInput = {
        ...body,
        dueDate: new Date(body.dueDate),
      };
      await service.execute(input);

      return NextResponse.json({ id: input.id });
    } catch (error) {
      return handleApiError(error);
    }
  });
}

export async function DELETE(req: NextRequest) {
  return withUserContext(req, async () => {
    const service = api.resolve(DeleteRecurringExpenseService);

    try {
      const id = await req.text();
      await service.execute(id);

      return new NextResponse(null, {
        status: 200,
        statusText: "Recurring expense deleted successfully",
      });
    } catch (error) {
      return handleApiError(error);
    }
  });
}
