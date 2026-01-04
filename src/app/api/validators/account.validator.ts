import { z } from "zod";
import { AccountType } from "@/app/api/domain/account/model/account.model";

const AccountTypeSchema = z.enum(Object.values(AccountType));

export const CreateAccountSchema = z.object({
  ref: z.string().min(1, "Reference is required"),
  name: z.string().min(1, "Name is required"),
  icon: z.string().min(1, "Icon is required"),
  type: AccountTypeSchema,
  balance: z.number(),
  description: z.string().optional(),
});

export const UpdateAccountSchema = z.object({
  id: z.string().min(1, "ID is required"),
  name: z.string().min(1, "Name must not be empty").optional(),
  icon: z.string().min(1, "Icon must not be empty").optional(),
  type: AccountTypeSchema.optional(),
  balance: z.number(),
  description: z.string().optional(),
});

export const DeleteAccountSchema = z.object({
  id: z.string().min(1, "ID is required"),
});
