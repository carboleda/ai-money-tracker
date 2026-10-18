import "reflect-metadata";
import { NextRequest, NextResponse } from "next/server";
import { CreateTransactionFromWebhookService } from "@/app/api/domain/transaction/service/create-transaction-from-webhook.service";
import { DomainError } from "@/app/api/domain/shared/errors/domain.error";
import { api } from "@/app/api";
import { withUserContext } from "@/app/api/context/initialize-context";

export async function POST(req: NextRequest) {
  return withUserContext(req, async () => {
    const text = await req.text();

    if (!text) {
      return NextResponse.json(
        { message: "Missing request body" },
        { status: 400 },
      );
    }

    try {
      const service = api.resolve(CreateTransactionFromWebhookService);
      const id = await service.execute({ text });

      return NextResponse.json({ success: true, id }, { status: 201 });
    } catch (error) {
      const domainError = error as DomainError<unknown>;
      return NextResponse.json(
        { message: domainError.message, code: domainError.name },
        { status: domainError.statusCode ?? 400 },
      );
    }
  });
}
