import "reflect-metadata";
import { container } from "tsyringe";
import { UpdateUserSettingsService } from "../update-user-settings.service";
import { UserRepository } from "@/app/api/domain/user/repository/user.repository";
import { getRepositoryToken } from "@/app/api/decorators/tsyringe.decorator";
import { UserModel, EmailStrategy } from "@/app/api/domain/user/model/user.model";
import { createUserModelFixture } from "./fixtures/user.model.fixture";

describe("UpdateUserSettingsService", () => {
  let service: UpdateUserSettingsService;
  let repository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    const testContainer = container.createChildContainer();

    const mockRepository: UserRepository = {
      getExistingUser: jest.fn(),
      updateOrCreateUser: jest.fn(),
      getAllUsers: jest.fn(),
      nullifyStaleTokens: jest.fn(),
      updateUserSettings: jest.fn(),
    };

    testContainer.register(getRepositoryToken(UserModel), {
      useValue: mockRepository,
    });
    testContainer.register(UpdateUserSettingsService, {
      useClass: UpdateUserSettingsService,
    });

    service = testContainer.resolve(UpdateUserSettingsService);
    repository = testContainer.resolve(getRepositoryToken(UserModel));
  });

  afterEach(() => {
    container.clearInstances();
  });

  it("preserves existing settings not included in the partial update", async () => {
    const user = createUserModelFixture({
      settings: { monthlyReportDay: 2, emailStrategy: EmailStrategy.STANDALONE },
    });
    repository.getExistingUser.mockResolvedValue(user);
    repository.updateUserSettings.mockImplementation((s) => Promise.resolve(s));

    const result = await service.execute({ language: "es" });

    expect(repository.updateUserSettings).toHaveBeenCalledWith({
      monthlyReportDay: 2,
      emailStrategy: EmailStrategy.STANDALONE,
      language: "es",
    });
    expect(result).toEqual({
      monthlyReportDay: 2,
      emailStrategy: EmailStrategy.STANDALONE,
      language: "es",
    });
  });

  it("unsets a setting back to its default when the value is null", async () => {
    const user = createUserModelFixture({
      settings: { monthlyReportDay: 10, language: "es" },
    });
    repository.getExistingUser.mockResolvedValue(user);
    repository.updateUserSettings.mockImplementation((s) => Promise.resolve(s));

    const result = await service.execute({ monthlyReportDay: null });

    expect(repository.updateUserSettings).toHaveBeenCalledWith({
      language: "es",
    });
    expect(result).toEqual({ language: "es" });
  });

  it("ignores undefined/omitted keys and starts from empty settings when the user has none", async () => {
    const user = createUserModelFixture({ settings: undefined });
    repository.getExistingUser.mockResolvedValue(user);
    repository.updateUserSettings.mockImplementation((s) => Promise.resolve(s));

    const result = await service.execute({
      pushNotificationsEnabled: true,
      earlyReminderDaysAhead: undefined,
    });

    expect(repository.updateUserSettings).toHaveBeenCalledWith({
      pushNotificationsEnabled: true,
    });
    expect(result).toEqual({ pushNotificationsEnabled: true });
  });

  it("works when no user exists yet", async () => {
    repository.getExistingUser.mockResolvedValue(null);
    repository.updateUserSettings.mockImplementation((s) => Promise.resolve(s));

    const result = await service.execute({ monthlyReportDay: 5 });

    expect(repository.updateUserSettings).toHaveBeenCalledWith({
      monthlyReportDay: 5,
    });
    expect(result).toEqual({ monthlyReportDay: 5 });
  });
});
