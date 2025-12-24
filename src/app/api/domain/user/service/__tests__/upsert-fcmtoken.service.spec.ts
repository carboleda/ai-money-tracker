import "reflect-metadata";
import { getRepositoryToken } from "@/app/api/decorators/tsyringe.decorator";
import { UserRepository } from "@/app/api/domain/user/repository/user.repository";
import { UpsertUserService } from "../upsert-user.service";
import { UserModel } from "@/app/api/domain/user/model/user.model";
import { container } from "tsyringe";

describe("UpsertFcmTokenService", () => {
  let repository: UserRepository;
  let service: UpsertUserService;

  beforeEach(() => {
    // Clear any existing registrations
    container.clearInstances();

    // Create mock repository
    const mockRepository: UserRepository = {
      getExistingUser: jest.fn(),
      updateOrCreateUser: jest.fn(),
      getAllUsers: jest.fn(),
    };

    // Register mock repository
    container.register(getRepositoryToken(UserModel), {
      useValue: mockRepository,
    });

    // Register service
    container.register(UpsertUserService, {
      useClass: UpsertUserService,
    });

    // Resolve instances
    service = container.resolve(UpsertUserService);
    repository = container.resolve<UserRepository>(
      getRepositoryToken(UserModel)
    );
  });

  afterEach(() => {
    container.clearInstances();
  });

  it("should call the repository to update or create user", async () => {
    // Arrange
    const user = new UserModel({
      id: "user-123",
      email: "test@example.com",
      devices: [
        {
          deviceId: "device-123",
          deviceName: "Chrome on macOS",
          fcmToken: "test-token",
        },
      ],
    });
    const expectedResult = "fcm-token-result";
    const updateOrCreateSpy = jest
      .spyOn(repository, "updateOrCreateUser")
      .mockResolvedValue(expectedResult);

    // Act
    const result = await service.execute(user);

    // Assert
    expect(updateOrCreateSpy).toHaveBeenCalledTimes(1);
    expect(updateOrCreateSpy).toHaveBeenCalledWith(user);
    expect(result).toEqual(expectedResult);
  });
});
