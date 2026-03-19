import "reflect-metadata";
import { NextRequest, NextResponse } from "next/server";
import { GetAllRecurrentExpensesService } from "@/app/api/domain/recurrent-expense/service/get-all-recurrent-expenses.service";
import { CreateRecurrentExpenseService } from "@/app/api/domain/recurrent-expense/service/create-recurrent-expense.service";
import { UpdateRecurrentExpenseService } from "@/app/api/domain/recurrent-expense/service/update-recurrent-expense.service";
import { DeleteRecurrentExpenseService } from "@/app/api/domain/recurrent-expense/service/delete-recurrent-expense.service";
import type { CreateRecurrentExpenseInput } from "@/app/api/domain/recurrent-expense/ports/inbound/create-recurrent-expense.port";
import type { UpdateRecurrentExpenseInput } from "@/app/api/domain/recurrent-expense/ports/inbound/update-recurrent-expense.port";
import { DomainError } from "@/app/api/domain/shared/errors/domain.error";
import { api } from "@/app/api";
import { withUserContext } from "@/app/api/context/initialize-context";

export async function GET(req: NextRequest) {
  return withUserContext(req, async () => {
    const service = api.resolve(GetAllRecurrentExpensesService);

    try {
      const result = await service.execute();
      return NextResponse.json(result);
    } catch (error) {
      const domainError = error as DomainError<unknown>;
      return new NextResponse(null, {
        status: domainError.statusCode,
        statusText: domainError.message,
      });
    }
  });
}

export async function POST(req: NextRequest) {
  return withUserContext(req, async () => {
    const service = api.resolve(CreateRecurrentExpenseService);

    try {
      const body = (await req.json()) as CreateRecurrentExpenseInput;
      const input: CreateRecurrentExpenseInput = {
        ...body,
        dueDate: new Date(body.dueDate),
      };
      const id = await service.execute(input);

      return NextResponse.json({ id });
    } catch (error) {
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
    const service = api.resolve(UpdateRecurrentExpenseService);

    try {
      const body = (await req.json()) as UpdateRecurrentExpenseInput;
      const input: UpdateRecurrentExpenseInput = {
        ...body,
        dueDate: new Date(body.dueDate),
      };
      await service.execute(input);

      return NextResponse.json({ id: input.id });
    } catch (error) {
      const domainError = error as DomainError<unknown>;
      return new NextResponse(null, {
        status: domainError.statusCode,
        statusText: domainError.message,
      });
    }
  });
}

export async function DELETE(req: NextRequest) {
  return withUserContext(req, async () => {
    const service = api.resolve(DeleteRecurrentExpenseService);

    try {
      const id = await req.text();
      await service.execute(id);

      return new NextResponse(null, {
        status: 200,
        statusText: "Recurrent expense deleted successfully",
      });
    } catch (error) {
      const domainError = error as DomainError<unknown>;
      return new NextResponse(null, {
        status: domainError.statusCode,
        statusText: domainError.message,
      });
    }
  });
}
