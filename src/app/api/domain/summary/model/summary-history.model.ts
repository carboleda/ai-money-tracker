export class SummaryHistoryModel {
  public readonly id?: string;
  public readonly incomes: number;
  public readonly expenses: number;
  public readonly transfers: number;
  public readonly createdAt: Date;

  constructor(params: {
    id?: string;
    incomes: number;
    expenses: number;
    transfers: number;
    createdAt: Date;
  }) {
    this.id = params.id;
    this.incomes = params.incomes;
    this.expenses = params.expenses;
    this.transfers = params.transfers;
    this.createdAt = params.createdAt;
  }
}
