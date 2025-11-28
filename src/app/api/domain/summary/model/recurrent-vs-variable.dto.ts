export interface RecurrentVsVariableEntryDto {
  value: number;
  type: "recurrent" | "variable";
}

export interface RecurrentVsVariableDto {
  count: RecurrentVsVariableEntryDto[];
  total: RecurrentVsVariableEntryDto[];
}
