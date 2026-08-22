import "reflect-metadata";
import { NextRequest, NextResponse } from "next/server";
import { ParseTransactionDraftService } from "@/app/api/domain/transaction/service/parse-transaction-draft.service";
import { DomainError } from "@/app/api/domain/shared/errors/domain.error";
import { api } from "@/app/api";
import { withUserContext } from "@/app/api/context/initialize-context";

interface ParseTransactionErrorDetails {
  code?: string;
  missingFields?: string[];
}

export async function POST(req: NextRequest) {
  return withUserContext(req, async () => {
    const parseTransactionDraftService = api.resolve(
      ParseTransactionDraftService
    );

    let text: string | undefined;
    let picture: string | undefined;

    const contentType = req.headers.get("content-type") ?? "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      text = formData.get("text")?.toString();
      picture = formData.get("picture")?.toString();
    } else {
      const body = (await req.json()) as { text?: string; picture?: string };
      text = body.text;
      picture = body.picture;
    }

    try {
      const draft = await parseTransactionDraftService.execute({
        text,
        picture,
      });

      return NextResponse.json(draft, { status: 200 });
    } catch (error) {
      const domainError = error as DomainError<ParseTransactionErrorDetails>;

      return NextResponse.json(
        {
          message: domainError.message,
          code: domainError.details?.code ?? domainError.name,
          ...(domainError.details?.missingFields
            ? { missingFields: domainError.details.missingFields }
            : {}),
        },
        { status: domainError.statusCode ?? 400 }
      );
    }
  });
}
