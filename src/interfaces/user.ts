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
}

export interface UserEntity {
  devices: UserDevice[];
  settings?: UserSettings;
}

export interface User extends UserEntity {
  id?: string;
  email?: string;
}
