import "reflect-metadata";
import { getRepositoryToken } from "@/app/api/decorators/tsyringe.decorator";
import { UserRepository } from "@/app/api/domain/user/repository/user.repository";
import { GetUserService } from "../get-user.service";
import { UserModel } from "@/app/api/domain/user/model/user.model";
import { container } from "tsyringe";
import { createUserModelFixture } from "./fixtures/user.model.fixture";

describe("GetUserService", () => {
  let repository: UserRepository;
  let service: GetUserService;

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
    container.register(GetUserService, {
      useClass: GetUserService,
    });

    // Resolve instances
    service = container.resolve(GetUserService);
    repository = container.resolve<UserRepository>(
      getRepositoryToken(UserModel)
    );
  });

  afterEach(() => {
    container.clearInstances();
  });

  it("should call the repository", async () => {
    // Arrange
    const user = createUserModelFixture();
    const getExistingUserSpy = jest
      .spyOn(repository, "getExistingUser")
      .mockResolvedValue(user);

    // Act
    const result = await service.execute();

    // Assert
    expect(getExistingUserSpy).toHaveBeenCalledTimes(1);
    expect(result).toEqual(user);
  });
});
