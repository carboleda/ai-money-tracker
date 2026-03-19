export interface RecurringVsVariableEntryDto {
  value: number;
  type: "recurrent" | "variable";
}

export interface RecurringVsVariableDto {
  count: RecurringVsVariableEntryDto[];
  total: RecurringVsVariableEntryDto[];
}
