import { Timestamp } from "firebase-admin/firestore";
import {
  CategoryType,
  CategoryBudget,
} from "@/app/api/domain/category/model/category.model";

export interface CategoryEntity extends FirebaseFirestore.DocumentData {
  ref: string; // Auto-generated, unique per user
  name: string;
  icon: string; // Emoji
  color?: string; // Hex color
  type: CategoryType; // "income" | "expense" | "transfer"
  description?: string;
  budget?: CategoryBudget; // Nested document
  isCustom: boolean;
  isDeleted: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
