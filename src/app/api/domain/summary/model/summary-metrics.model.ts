export class SummaryMetricsModel {
  public readonly totalIncomes: number;
  public readonly totalExpenses: number;
  public readonly totalPending: number;
  public readonly totalTransfers: number;
  public readonly totalBalance: number;

  constructor(params: {
    totalIncomes: number;
    totalExpenses: number;
    totalPending: number;
    totalTransfers: number;
    totalBalance: number;
  }) {
    this.totalIncomes = params.totalIncomes;
    this.totalExpenses = params.totalExpenses;
    this.totalPending = params.totalPending;
    this.totalTransfers = params.totalTransfers;
    this.totalBalance = params.totalBalance;
  }
}
