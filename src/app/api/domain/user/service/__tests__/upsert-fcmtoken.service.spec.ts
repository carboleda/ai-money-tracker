import "reflect-metadata";
import { getRepositoryToken } from "@/app/api/decorators/tsyringe.decorator";
import { UserRepository } from "@/app/api/domain/user/repository/user.repository";
import { UpsertFcmTokenService } from "../upsert-fcmtoken.service";
import { UserModel } from "@/app/api/domain/user/model/user.model";
import { container } from "tsyringe";

describe("UpsertFcmTokenService", () => {
  let repository: UserRepository;
  let service: UpsertFcmTokenService;

  beforeEach(() => {
    // Clear any existing registrations
    container.clearInstances();

    // Create mock repository
    const mockRepository: UserRepository = {
      getExistingUser: jest.fn(),
      updateOrCreateUser: jest.fn(),
    };

    // Register mock repository
    container.register(getRepositoryToken(UserModel), {
      useValue: mockRepository,
    });

    // Register service
    container.register(UpsertFcmTokenService, {
      useClass: UpsertFcmTokenService,
    });

    // Resolve instances
    service = container.resolve(UpsertFcmTokenService);
    repository = container.resolve<UserRepository>(
      getRepositoryToken(UserModel)
    );
  });

  afterEach(() => {
    container.clearInstances();
  });

  it("should call the repository", async () => {
    // Arrange
    const fcmToken = "test-token";
    const updateOrCreateSpy = jest
      .spyOn(repository, "updateOrCreateUser")
      .mockResolvedValue(fcmToken);

    // Act
    const result = await service.execute(fcmToken);

    // Assert
    expect(updateOrCreateSpy).toHaveBeenCalledTimes(1);
    expect(updateOrCreateSpy).toHaveBeenCalledWith(fcmToken);
    expect(result).toEqual(fcmToken);
  });
});
