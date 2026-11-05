import {
  Injectable,
  InjectRepository,
} from "@/app/api/decorators/tsyringe.decorator";
import { Service } from "@/app/api/domain/shared/ports/service.interface";
import { UserModel, UserSettings } from "../model/user.model";
import type { UserRepository } from "../repository/user.repository";
import { UpdateUserSettingsInput } from "../ports/inbound/update-user-settings.port";

@Injectable()
export class UpdateUserSettingsService implements Service<
  UpdateUserSettingsInput,
  UserSettings
> {
  constructor(
    @InjectRepository(UserModel)
    private readonly userRepository: UserRepository
  ) {}

  async execute(input: UpdateUserSettingsInput): Promise<UserSettings> {
    const existingUser = await this.userRepository.getExistingUser();
    const currentSettings: UserSettings = { ...existingUser?.settings };

    for (const [key, value] of Object.entries(input) as [
      keyof UserSettings,
      UserSettings[keyof UserSettings] | null | undefined
    ][]) {
      if (value === undefined) continue;
      if (value === null) {
        delete currentSettings[key];
      } else {
        currentSettings[key] = value as never;
      }
    }

    return this.userRepository.updateUserSettings(currentSettings);
  }
}
