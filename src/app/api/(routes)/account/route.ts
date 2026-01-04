import "reflect-metadata";
import { z } from "zod";
import { GetAllAccountsService } from "@/app/api/domain/account/service/get-all.service";
import { CreateAccountService } from "@/app/api/domain/account/service/create-account.service";
import { UpdateAccountService } from "@/app/api/domain/account/service/update-account.service";
import { DeleteAccountService } from "@/app/api/domain/account/service/delete-account.service";
import { NextRequest, NextResponse } from "next/server";
import { api } from "@/app/api/index";
import { withUserContext } from "@/app/api/context/initialize-context";
import { CreateAccountInput } from "@/app/api/domain/account/ports/inbound/create-account.port";
import { UpdateAccountInput } from "@/app/api/domain/account/ports/inbound/update-account.port";
import { DomainError } from "@/app/api/domain/shared/errors/domain.error";
import {
  CreateAccountSchema,
  UpdateAccountSchema,
  DeleteAccountSchema,
} from "@/app/api/validators/account.validator";

export async function GET(req: NextRequest) {
  return withUserContext(req, async () => {
    const service = api.resolve(GetAllAccountsService);
    const accounts = await service.execute();

    return NextResponse.json({ accounts });
  });
}

export async function POST(req: NextRequest) {
  return withUserContext(req, async () => {
    try {
      const body = await req.json();

      // Validate request body
      const validatedData = CreateAccountSchema.parse(body);

      const input: CreateAccountInput = {
        ref: validatedData.ref,
        name: validatedData.name,
        icon: validatedData.icon,
        type: validatedData.type,
        balance: validatedData.balance,
        description: validatedData.description,
      };

      const service = api.resolve(CreateAccountService);
      const id = await service.execute(input);

      return NextResponse.json({ id });
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
      const validatedData = UpdateAccountSchema.parse(body);

      const input: UpdateAccountInput = {
        id: validatedData.id,
        name: validatedData.name,
        icon: validatedData.icon,
        type: validatedData.type,
        balance: validatedData.balance,
        description: validatedData.description,
      };

      const service = api.resolve(UpdateAccountService);
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

export async function DELETE(req: NextRequest) {
  return withUserContext(req, async () => {
    try {
      const id = await req.text();

      // Validate request body
      const validatedData = DeleteAccountSchema.parse({ id });

      const service = api.resolve(DeleteAccountService);
      await service.execute(validatedData.id);

      return NextResponse.json(null, {
        status: 204,
        statusText: "Account deleted successfully",
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
