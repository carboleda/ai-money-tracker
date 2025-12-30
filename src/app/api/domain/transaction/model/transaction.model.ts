export enum TransactionType {
  INCOME = "income",
  EXPENSE = "expense",
  TRANSFER = "transfer",
}

export enum TransactionStatus {
  PENDING = "pending",
  COMPLETE = "complete",
}

export enum TransactionCategory {
  Salario = "Salario",
  PagoTC = "Pago TC",
  Alimentos = "Alimentos",
  Mercado = "Mercado",
  Educacion = "Educación",
  Inversion = "Inversión",
  Salud = "Salud",
  Servicios = "Servicios",
  Transporte = "Transporte",
  Vivienda = "Vivienda",
  Bebe = "Bebé",
  Zeus = "Zeus",
  Ocio = "Ocio",
  Impuesto = "Impuesto",
  Retiros = "Retiros",
  Vestuario = "Vestuario",
  Otros = "Otros",
}

export type AccountSummary = {
  ref: string;
  name?: string | null;
  icon?: string | null;
};

export class TransactionModel {
  id: string | null;
  description: string;
  paymentLink?: string;
  notes?: string;
  type: TransactionType;
  status: TransactionStatus;
  category?: TransactionCategory | string;
  sourceAccount: AccountSummary;
  destinationAccount?: AccountSummary;
  amount: number;
  createdAt: Date;
  isRecurrent?: boolean;

  constructor(params: {
    id: string | null;
    description: string;
    paymentLink?: string;
    notes?: string;
    type: TransactionType;
    status: TransactionStatus;
    category?: TransactionCategory | string;
    sourceAccount: AccountSummary;
    destinationAccount?: AccountSummary;
    amount: number;
    createdAt: Date;
    isRecurrent?: boolean;
  }) {
    this.id = params.id;
    this.description = params.description;
    this.paymentLink = params.paymentLink;
    this.notes = params.notes;
    this.type = params.type;
    this.status = params.status;
    this.category = params.category;
    this.sourceAccount = params.sourceAccount;
    this.destinationAccount = params.destinationAccount;
    this.amount = params.amount;
    this.createdAt = params.createdAt;
    this.isRecurrent = params.isRecurrent ?? false;
  }
}
