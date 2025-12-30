import "reflect-metadata";
import { AccountType } from "@/app/api/domain/account/model/account.model";
import { getRepositoryToken } from "@/app/api/decorators/tsyringe.decorator";
import { AccountRepository } from "@/app/api/domain/account/repository/account.repository";
import { GetAllAccountsService } from "@/app/api/domain/account/service/get-all.service";
import { AccountModel } from "../../model/account.model";
import { container } from "tsyringe";

describe("GetAllAccountsService", () => {
  let repository: AccountRepository;
  let service: GetAllAccountsService;

  beforeEach(() => {
    // Clear any existing registrations
    container.clearInstances();

    // Create mock repository
    const mockRepository: AccountRepository = {
      getAll: jest.fn(),
      getAccountById: jest.fn(),
      updateOrCreateAccount: jest.fn(),
      getAccountByRef: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    // Register mock repository
    container.register(getRepositoryToken(AccountModel), {
      useValue: mockRepository,
    });

    // Register service
    container.register(GetAllAccountsService, {
      useClass: GetAllAccountsService,
    });

    // Resolve instances
    service = container.resolve(GetAllAccountsService);
    repository = container.resolve<AccountRepository>(
      getRepositoryToken(AccountModel)
    );
  });

  afterEach(() => {
    container.clearInstances();
  });

  it("should call the repository", async () => {
    // Arrange
    const mockAccounts: AccountModel[] = [
      {
        name: "A",
        balance: 100,
        id: "1",
        ref: "ref1",
        icon: "icon1",
        type: AccountType.SAVING,
        isDeleted: false,
      },
      {
        name: "B",
        balance: 200,
        id: "2",
        ref: "ref2",
        icon: "icon2",
        type: AccountType.CREDIT,
        isDeleted: false,
      },
    ];
    const getAllSpy = jest
      .spyOn(repository, "getAll")
      .mockResolvedValue(mockAccounts);

    // Act
    const result = await service.execute();

    // Assert
    expect(getAllSpy).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockAccounts);
  });
});
