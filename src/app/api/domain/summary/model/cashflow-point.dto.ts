export interface CashflowPointDto {
  date: string;
  monthLabel: string;
  incomes: number;
  expenses: number;
  transfers: number;
  netFlow: number;
  isForecast?: boolean;
}
