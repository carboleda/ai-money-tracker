export interface UserDevice {
  deviceId: string;
  deviceName: string;
  fcmToken?: string;
}

export interface UserSettings {
  pushNotificationsEnabled?: boolean;
  emailStrategy?: "digest" | "standalone";
  earlyReminderDaysAhead?: number;
  paymentNotificationsEnabled?: boolean;
  language?: "en" | "es";
  monthlyReportDay?: number;
  forecastHorizonMonths?: 3 | 4 | 5 | 6;
  forecastBaselineMonths?: 3 | 6 | 10 | 12;
  recentTransactionsLimit?: 5 | 7 | 10;
  historyWindowMonths?: 6 | 12;
}

export interface UserEntity {
  devices: UserDevice[];
  settings?: UserSettings;
}

export interface User extends UserEntity {
  id?: string;
  email?: string;
}
