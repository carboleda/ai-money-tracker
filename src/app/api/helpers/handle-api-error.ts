import { z } from "zod";
import { NextResponse } from "next/server";
import { DomainError } from "@/app/api/domain/shared/errors/domain.error";

export function handleApiError(error: unknown): NextResponse {
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: error.issues,
      },
      { status: 400 },
    );
  }

  const domainError = error as DomainError<unknown>;
  return new NextResponse(null, {
    status: domainError.statusCode,
    statusText: domainError.message,
  });
}
