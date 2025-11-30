export type CronjobResult = {
  userId: string;
  notificationStatus: "fulfilled" | "rejected";
  summaryStatus: "fulfilled" | "rejected";
};

export type CronjobExecutionResult = {
  success: boolean;
  processedUsers: number;
  details: CronjobResult[];
};
