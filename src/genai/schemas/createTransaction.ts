import { z } from "genkit";
import { TransactionCategory } from "@/interfaces/transaction";

const categories = Object.values(TransactionCategory);

export const TransactionSchema = z.object({
  description: z
    .string()
    .describe(
      "Transaction description. A summary according to the purchased items, it should be at most 100 characters long"
    ),
  amount: z
    .number()
    .describe(
      "Transaction amount in COP. Remove the thousand separators. This value is usually next to a label Venta, Total, etc. e.g. 123000, 15000, 1000, 20000.34"
    ),
  type: z.enum(["income", "expense", "transfer"]).describe("Transaction type"),
  category: z
    .string()
    .describe(
      `Based on the description, it should be one of the following: ${categories}.`
    ),
  sourceAccount: z
    .string()
    .describe(
      "Source account if it applies. This is the account where the money comes from. E.g. 'C1234', 'AFC', 'C2045'"
    ),
  destinationAccount: z
    .string()
    .optional()
    .describe(
      "Destination account if it applies. This is the account where the money goes to. E.g. 'C1234', 'AFC', 'C2045'"
    ),
  createdAt: z
    .string()
    .optional()
    .describe("Transaction date and time in ISO format yyyy-MM-dd'T'HH:mm"),
});

export const ErrorSchema = z.object({
  error: z.string().describe("Error message if the transaction is invalid"),
});

export const InputSchema = z.union([
  z.object({
    text: z
      .string()
      .describe(
        "Text to extract transaction data from. It can be a receipt, a bank statement, or any text that contains transaction information."
      ),
    picture: z
      .never()
      .optional()
      .describe("Picture is not required when text is provided."),
  }),
  z.object({
    text: z
      .never()
      .optional()
      .describe(
        "Text is not required when picture is provided. It can be left empty."
      ),
    picture: z
      .string()
      .describe(
        "Picture to extract transaction data from. It can be a receipt, a bank statement, or any image that contains transaction information. The image should be in base64 format."
      ),
  }),
]);

export const OutputSchema = z.object({
  type: z.enum(["success", "error"]),
  data: TransactionSchema.optional(),
  error: ErrorSchema.optional(),
});

export type TransactionType = z.infer<typeof TransactionSchema>;
export type CreateTransactionInputType = z.infer<typeof InputSchema>;
export type CreateTransactionOutputType = z.infer<typeof OutputSchema>;
