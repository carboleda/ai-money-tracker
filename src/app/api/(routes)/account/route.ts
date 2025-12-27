import "reflect-metadata";
import { z } from "zod";
import { GetAllAccountsService } from "@/app/api/domain/account/service/get-all.service";
import { CreateAccountService } from "@/app/api/domain/account/service/create-account.service";
import { UpdateAccountService } from "@/app/api/domain/account/service/update-account.service";
import { DeleteAccountService } from "@/app/api/domain/account/service/delete-account.service";
import { NextRequest, NextResponse } from "next/server";
import { api } from "@/app/api/index";
import { withUserContext } from "@/app/api/context/initialize-context";
import {
  CreateAccountInput,
  UpdateAccountInput,
} from "@/app/api/domain/account/model/account.model";

// Validation schemas
const AccountTypeSchema = z.enum(["saving", "credit", "investment"]);

const CreateAccountSchema = z.object({
  ref: z.string().min(1, "Reference is required"),
  name: z.string().min(1, "Name is required"),
  icon: z.string().min(1, "Icon is required"),
  type: AccountTypeSchema,
  balance: z.number().min(0, "Balance must be non-negative"),
  description: z.string().optional(),
});

const UpdateAccountSchema = z.object({
  id: z.string().min(1, "ID is required"),
  name: z.string().min(1, "Name must not be empty").optional(),
  icon: z.string().min(1, "Icon must not be empty").optional(),
  type: AccountTypeSchema.optional(),
  description: z.string().optional(),
});

const DeleteAccountSchema = z.object({
  id: z.string().min(1, "ID is required"),
});

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

      const message = error instanceof Error ? error.message : "Unknown error";

      // Check for duplicate ref error
      if (message.includes("already exists")) {
        return NextResponse.json({ error: message }, { status: 409 });
      }

      return NextResponse.json({ error: message }, { status: 500 });
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

      const message = error instanceof Error ? error.message : "Unknown error";

      if (message.includes("not found")) {
        return NextResponse.json({ error: message }, { status: 404 });
      }

      return NextResponse.json({ error: message }, { status: 500 });
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

      const message = error instanceof Error ? error.message : "Unknown error";

      if (message.includes("not found")) {
        return NextResponse.json({ error: message }, { status: 404 });
      }

      return NextResponse.json({ error: message }, { status: 500 });
    }
  });
}
