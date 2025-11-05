import "reflect-metadata";
import { NextRequest, NextResponse } from "next/server";
import { GetAllRecurrentExpensesService } from "@/app/api/domain/recurrent-expense/service/get-all-recurrent-expenses.service";
import { CreateRecurrentExpenseService } from "@/app/api/domain/recurrent-expense/service/create-recurrent-expense.service";
import { UpdateRecurrentExpenseService } from "@/app/api/domain/recurrent-expense/service/update-recurrent-expense.service";
import { DeleteRecurrentExpenseService } from "@/app/api/domain/recurrent-expense/service/delete-recurrent-expense.service";
import { RecurrentExpenseModel } from "@/app/api/domain/recurrent-expense/model/recurrent-expense.model";
import { DomainError } from "@/app/api/domain/errors/domain.error";
import { api } from "@/app/api";

export async function GET() {
  const service = api.resolve(GetAllRecurrentExpensesService);

  try {
    const result = await service.execute();

    // Transform the response to match the original API format
    const recurringExpensesConfig = result.recurringExpenses.map((expense) => ({
      ...expense,
      dueDate: expense.dueDate.toISOString(),
    }));

    return NextResponse.json({
      recurringExpensesConfig,
      groupTotal: result.groupTotal,
    });
  } catch (error) {
    const domainError = error as DomainError<unknown>;
    return new NextResponse(null, {
      status: domainError.statusCode,
      statusText: domainError.message,
    });
  }
}

export async function POST(req: NextRequest) {
  const service = api.resolve(CreateRecurrentExpenseService);

  try {
    const recurrentExpense = (await req.json()) as RecurrentExpenseModel;
    recurrentExpense.dueDate = new Date(recurrentExpense.dueDate);
    const id = await service.execute(recurrentExpense);

    return NextResponse.json({ id });
  } catch (error) {
    const domainError = error as DomainError<unknown>;
    return new NextResponse(null, {
      status: domainError.statusCode,
      statusText: domainError.message,
    });
  }
}

export async function PUT(req: NextRequest) {
  const service = api.resolve(UpdateRecurrentExpenseService);

  try {
    const recurrentExpense = (await req.json()) as RecurrentExpenseModel;
    recurrentExpense.dueDate = new Date(recurrentExpense.dueDate);
    await service.execute(recurrentExpense);

    return NextResponse.json({ id: recurrentExpense.id });
  } catch (error) {
    const domainError = error as DomainError<unknown>;
    return new NextResponse(null, {
      status: domainError.statusCode,
      statusText: domainError.message,
    });
  }
}

export async function DELETE(req: NextRequest) {
  const service = api.resolve(DeleteRecurrentExpenseService);

  try {
    const id = await req.text();
    await service.execute(id);

    return new NextResponse(null, {
      status: 204,
      statusText: "Recurrent expense deleted successfully",
    });
  } catch (error) {
    const domainError = error as DomainError<unknown>;
    return new NextResponse(null, {
      status: domainError.statusCode,
      statusText: domainError.message,
    });
  }
}
