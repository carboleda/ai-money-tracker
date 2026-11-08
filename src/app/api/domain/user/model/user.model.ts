export interface UserDeviceModel {
  deviceId: string;
  deviceName: string;
  fcmToken?: string | null;
}

export enum EmailStrategy {
  DIGEST = "digest",
  STANDALONE = "standalone",
}

export type UserSettings = {
  // Notifications
  pushNotificationsEnabled?: boolean;
  emailStrategy?: EmailStrategy;
  earlyReminderDaysAhead?: number;
  paymentNotificationsEnabled?: boolean;

  // General & Reports
  language?: "en" | "es";
  monthlyReportDay?: number;
};

export class UserModel {
  public id: string;
  public email: string;
  public devices?: UserDeviceModel[];
  public settings?: UserSettings;

  constructor(params: {
    id: string;
    email: string;
    devices: UserDeviceModel[];
    settings?: UserSettings;
  }) {
    this.id = params.id;
    this.email = params.email;
    this.devices = params.devices;
    this.settings = params.settings;
  }
}
