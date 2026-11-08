import { UserSettings } from "../../model/user.model";

/**
 * A `null` value for a given key resets that setting back to its default
 * (i.e. unsets it), while `undefined`/omitted keys are left untouched.
 */
export type UpdateUserSettingsInput = {
  [K in keyof UserSettings]?: UserSettings[K] | null;
};
