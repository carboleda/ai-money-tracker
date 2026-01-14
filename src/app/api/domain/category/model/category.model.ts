export enum CategoryType {
  INCOME = "income",
  EXPENSE = "expense",
  TRANSFER = "transfer",
}

export type CategoryBudget = {
  limit: number;
  alertThreshold?: number;
};

export class CategoryModel {
  id: string | null;
  ref: string;
  name: string;
  icon: string; // Emoji
  color?: string; // Hex color
  type: CategoryType;
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
    type: CategoryType;
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
    this.type = params.type;
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
