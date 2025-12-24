export type ScheduleResult = {
  userId: string;
  created: number;
  skipped: number;
};

export type ScheduleExecutionResult = {
  success: boolean;
  processedUsers: number;
  details: ScheduleResult[];
};
