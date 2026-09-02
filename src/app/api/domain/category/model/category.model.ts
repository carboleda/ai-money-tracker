export enum CategoryType {
  INCOME = "income",
  EXPENSE = "expense",
  TRANSFER = "transfer",
}

export type CategoryBudget = {
  limit: number;
  alertThreshold?: number;
};

export interface PredefinedCategory {
  ref: string;
  name: string;
  icon: string;
  color: string;
  restrictedTypes: CategoryType[];
  description: string;
}

/**
 * A category is valid for a given transaction type when restrictedTypes is
 * empty (no restriction) or explicitly includes that type.
 */
export function categoryAppliesToType(
  restrictedTypes: CategoryType[],
  type: CategoryType
): boolean {
  return restrictedTypes.length === 0 || restrictedTypes.includes(type);
}

export class CategoryModel {
  id: string | null;
  ref: string;
  name: string;
  icon: string; // Emoji
  color?: string; // Hex color
  restrictedTypes: CategoryType[];
  description?: string;
  budget?: CategoryBudget;
  isCustom: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(params: {
    id: string | null;
    ref: string;
    name: string;
    icon: string;
    color?: string;
    restrictedTypes?: CategoryType[];
    description?: string;
    budget?: CategoryBudget;
    isCustom: boolean;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = params.id;
    this.ref = params.ref;
    this.name = params.name;
    this.icon = params.icon;
    this.color = params.color;
    this.restrictedTypes = params.restrictedTypes ?? [];
    this.description = params.description;
    this.budget = params.budget;
    this.isCustom = params.isCustom;
    this.isDeleted = params.isDeleted;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
  }
}

export type CategorySummary = {
  ref: string;
  name: string;
  icon?: string | null;
  color?: string | null;
  isCustom?: boolean;
};

export type BudgetStatus = {
  limit: number;
  alertThreshold?: number;
  spent: number;
  remaining: number;
  percentageUsed: number;
  isAlerted: boolean;
};
