import { z } from "zod";
import { EmailStrategy } from "@/app/api/domain/user/model/user.model";

export const UpdateUserSettingsSchema = z.object({
  pushNotificationsEnabled: z.boolean().nullable().optional(),
  emailStrategy: z.nativeEnum(EmailStrategy).nullable().optional(),
  earlyReminderDaysAhead: z.number().int().min(0).max(30).nullable().optional(),
  paymentNotificationsEnabled: z.boolean().nullable().optional(),
  language: z.enum(["en", "es"]).nullable().optional(),
  monthlyReportDay: z.number().int().min(1).max(31).nullable().optional(),
  forecastHorizonMonths: z
    .union([z.literal(3), z.literal(4), z.literal(5), z.literal(6)])
    .nullable()
    .optional(),
  forecastBaselineMonths: z
    .union([z.literal(3), z.literal(6), z.literal(10), z.literal(12)])
    .nullable()
    .optional(),
  recentTransactionsLimit: z
    .union([z.literal(5), z.literal(7), z.literal(10)])
    .nullable()
    .optional(),
  historyWindowMonths: z
    .union([z.literal(6), z.literal(12)])
    .nullable()
    .optional(),
});
