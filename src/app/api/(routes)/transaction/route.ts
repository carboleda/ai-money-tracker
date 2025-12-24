import "reflect-metadata";
import { NextRequest, NextResponse } from "next/server";
import { GenerateTransactionService } from "@/app/api/domain/transaction/service/generate-transaction.service";
import { UpdateTransactionService } from "@/app/api/domain/transaction/service/update-transaction.service";
import { DeleteTransactionService } from "@/app/api/domain/transaction/service/delete-transaction.service";
import { TransactionModel } from "@/app/api/domain/transaction/model/transaction.model";
import { DomainError } from "@/app/api/domain/errors/domain.error";
import { api } from "@/app/api";
import { withUserContext } from "@/app/api/context/initialize-context";

export async function POST(req: NextRequest) {
  return withUserContext(req, async () => {
    const generateTransactionService = api.resolve(GenerateTransactionService);

    const formData = await req.formData();
    const text = formData.get("text")?.toString();
    const picture = formData.get("picture")?.toString();
    const createdAtManual = formData.get("createdAt")?.toString();
    const sourceAccount = formData.get("sourceAccount")?.toString();

    if (!text && !picture) {
      return new NextResponse(null, {
        status: 400,
        statusText: "Either description or picture is required",
      });
    }

    try {
      const generateTransacton = {
        text,
        picture,
        sourceAccount,
        createdAtManual: createdAtManual ? new Date(createdAtManual) : null,
      };

      const id = await generateTransactionService.execute(generateTransacton);

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
    const updateTransactionService = api.resolve(UpdateTransactionService);

    const transactionModel = (await req.json()) as TransactionModel;
    transactionModel.createdAt = new Date(transactionModel.createdAt);
    await updateTransactionService.execute(transactionModel);

    return NextResponse.json({ id: transactionModel.id });
  });
}

export async function DELETE(req: NextRequest) {
  return withUserContext(req, async () => {
    const deleteTransactionService = api.resolve(DeleteTransactionService);

    const id = await req.text();
    await deleteTransactionService.execute(id);

    return new NextResponse(null, {
      status: 204,
      statusText: "Transaction deleted successfully",
    });
  });
}
