import { z } from "zod";
import { EmailStrategy } from "@/app/api/domain/user/model/user.model";

export const UpdateUserSettingsSchema = z.object({
  pushNotificationsEnabled: z.boolean().nullable().optional(),
  emailStrategy: z.nativeEnum(EmailStrategy).nullable().optional(),
  earlyReminderDaysAhead: z.number().int().min(0).max(30).nullable().optional(),
  paymentNotificationsEnabled: z.boolean().nullable().optional(),
  language: z.enum(["en", "es"]).nullable().optional(),
  monthlyReportDay: z.number().int().min(1).max(31).nullable().optional(),
});
