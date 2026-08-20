import "reflect-metadata";
import { NextRequest, NextResponse } from "next/server";
import { CreateTransactionService } from "@/app/api/domain/transaction/service/create-transaction.service";
import { UpdateTransactionService } from "@/app/api/domain/transaction/service/update-transaction.service";
import { DeleteTransactionService } from "@/app/api/domain/transaction/service/delete-transaction.service";
import { DomainError } from "@/app/api/domain/shared/errors/domain.error";
import { api } from "@/app/api";
import { withUserContext } from "@/app/api/context/initialize-context";
import { UpdateTransactionInput } from "@/app/api/domain/transaction/ports/inbound/update-transaction.port";
import { CreateTransactionPayload } from "@/app/api/domain/transaction/ports/inbound/create-transaction.port";
import { TransactionStatus } from "@/app/api/domain/transaction/model/transaction.model";

export async function POST(req: NextRequest) {
  return withUserContext(req, async () => {
    const createTransactionService = api.resolve(CreateTransactionService);
    const body = (await req.json()) as CreateTransactionPayload;

    try {
      const id = await createTransactionService.execute({
        ...body,
        createdAt: body.createdAt ? new Date(body.createdAt) : new Date(),
        status: body.status ?? TransactionStatus.COMPLETE,
      });

      return NextResponse.json({ id }, { status: 200 });
    } catch (error) {
      const domainError = error as DomainError<unknown>;
      return NextResponse.json(
        { message: domainError.message, code: domainError.name },
        { status: domainError.statusCode ?? 400 }
      );
    }
  });
}

export async function PUT(req: NextRequest) {
  return withUserContext(req, async () => {
    const updateTransactionService = api.resolve(UpdateTransactionService);

    const transaction = (await req.json()) as UpdateTransactionInput;
    transaction.createdAt = transaction.createdAt ?? new Date().toISOString();
    await updateTransactionService.execute(transaction);

    return NextResponse.json({ id: transaction.id });
  });
}

export async function DELETE(req: NextRequest) {
  return withUserContext(req, async () => {
    const deleteTransactionService = api.resolve(DeleteTransactionService);

    const id = await req.text();
    await deleteTransactionService.execute(id);

    return new NextResponse(null, {
      status: 200,
      statusText: "Transaction deleted successfully",
    });
  });
}
