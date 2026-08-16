import { z } from "zod";
import { CategoryType } from "@/app/api/domain/category/model/category.model";

const CategoryTypeSchema = z.enum(Object.values(CategoryType));

const BudgetSchema = z.object({
  limit: z.number().positive("Budget limit must be positive"),
  alertThreshold: z.number().int().min(0).max(100).optional(),
});

export const CreateCategorySchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name must be 50 characters or less"),
  icon: z.string().min(1, "Icon is required"), // Accept any emoji or icon string
  type: CategoryTypeSchema,
  description: z
    .string()
    .max(200, "Description must be 200 characters or less")
    .optional(),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, "Color must be a valid hex color code")
    .optional(),
  budget: BudgetSchema.optional(),
});

export const UpdateCategorySchema = CreateCategorySchema.omit({
  type: true,
})
  .partial()
  .extend({
    id: z.string().min(1, "ID is required"),
  });

export const DeleteCategorySchema = z.object({
  id: z.string().min(1, "ID is required"),
});

export const CategoryOutputSchema = z.object({
  id: z.string(),
  ref: z.string(),
  name: z.string(),
  icon: z.string(),
  color: z.string().optional(),
  type: CategoryTypeSchema,
  description: z.string().optional(),
  budget: BudgetSchema.optional(),
  isCustom: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CategoryWithBudgetStatusOutputSchema = CategoryOutputSchema.extend(
  {
    budget: z
      .object({
        limit: z.number(),
        alertThreshold: z.number().optional(),
        spent: z.number(),
        remaining: z.number(),
        percentageUsed: z.number(),
        isAlerted: z.boolean(),
      })
      .optional(),
  }
);
