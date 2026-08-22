import { z } from "genkit";
import { TransactionType } from "@/app/api/domain/transaction/model/transaction.model";

export const ParseTransactionDataSchema = z.object({
  description: z
    .string()
    .describe("Concise summary of transaction/merchant (max 100 chars)"),
  amount: z
    .number()
    .describe("Transaction amount in local currency (positive number)"),
  type: z
    .nativeEnum(TransactionType)
    .describe("Transaction type: income, expense, or transfer"),
  category: z
    .string()
    .describe("Category reference ID matching user's categories list"),
  sourceAccount: z
    .string()
    .describe("Source account reference ID matching user's accounts list"),
  destinationAccount: z
    .string()
    .optional()
    .describe("Destination account reference ID for transfers"),
  createdAt: z
    .string()
    .optional()
    .describe("Date and time in ISO format yyyy-MM-dd'T'HH:mm"),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe("AI confidence score between 0.0 and 1.0"),
});

export const ParseTransactionInputSchema = z.object({
  categories: z.array(
    z.object({
      ref: z.string(),
      name: z.string().optional(),
      description: z.string().optional(),
    })
  ),
  accounts: z.array(
    z.object({
      ref: z.string(),
      name: z.string(),
      type: z.string().optional(),
      description: z.string().optional(),
    })
  ),
  text: z.string().optional(),
  picture: z.string().optional(),
  currentDate: z
    .string()
    .describe("Current date/time in ISO format, used to resolve missing or relative dates"),
});

export const ParseTransactionErrorSchema = z.object({
  error: z.string().describe("Error message if the transaction is invalid"),
});

export const ParseTransactionOutputSchema = z.object({
  type: z.enum(["success", "error"]),
  data: ParseTransactionDataSchema.optional(),
  error: ParseTransactionErrorSchema.optional(),
});

export type ParseTransactionDataType = z.infer<
  typeof ParseTransactionDataSchema
>;
export type ParseTransactionInputType = z.infer<
  typeof ParseTransactionInputSchema
>;
export type ParseTransactionOutputType = z.infer<
  typeof ParseTransactionOutputSchema
>;
