export enum Frequency {
  MONTHLY = "monthly",
  BIANNUAL = "biannual",
  YEARLY = "yearly",
}

export enum FrequencyGroup {
  MONTHLY = "monthly",
  OTHERS = "others",
}

export class RecurrentExpenseModel {
  id: string;
  description: string;
  category: string;
  frequency: Frequency;
  dueDate: Date;
  disabled: boolean;
  amount: number;
  paymentLink?: string;
  notes?: string;

  constructor(params: {
    id: string;
    description: string;
    category: string;
    frequency: Frequency;
    dueDate: Date;
    disabled?: boolean;
    amount: number;
    paymentLink?: string;
    notes?: string;
  }) {
    this.id = params.id;
    this.description = params.description;
    this.category = params.category;
    this.frequency = params.frequency;
    this.dueDate = params.dueDate;
    this.disabled = params.disabled ?? false;
    this.amount = params.amount;
    this.paymentLink = params.paymentLink;
    this.notes = params.notes;
  }
} 