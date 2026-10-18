import { z } from "zod";
import { TransactionStatus } from "@/app/api/domain/transaction/model/transaction.model";

export const TransactionParamsSchema = z.object({
  status: z.enum(Object.values(TransactionStatus)),
});
