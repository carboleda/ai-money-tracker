export interface MetricTrendDto {
  current: number;
  previous: number;
  percentageChange: number;
}

export interface SummaryTrendsDto {
  balance: MetricTrendDto;
  incomes: MetricTrendDto;
  expenses: MetricTrendDto;
}
