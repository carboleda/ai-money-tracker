import "reflect-metadata";
import { container } from "tsyringe";
import { AccountFirestoreRepository } from "@/app/api/drivers/firestore/account/account-firestore.repository";
import { AccountAdapter } from "@/app/api/drivers/firestore/account/account.adapter";
import { Collections } from "@/app/api/drivers/firestore/types";
import { Firestore } from "firebase-admin/firestore";
import { getUserIdToken } from "@/app/api/decorators/tsyringe.decorator";

describe("AccountFirestoreRepository", () => {
  let firestore: Firestore;
  let repository: AccountFirestoreRepository;

  beforeEach(() => {
    const testContainer = container.createChildContainer();

    const mockFirestore = {
      collection: jest.fn().mockReturnValue({
        doc: jest.fn().mockReturnValue({
          collection: jest.fn().mockReturnValue({
            get: jest.fn(),
            where: jest.fn().mockReturnThis(),
            doc: jest.fn().mockReturnThis(),
            add: jest.fn(),
          }),
        }),
      }),
    } as unknown as Firestore;

    testContainer.register(Firestore, {
      useValue: mockFirestore,
    });

    // Register USER_ID_TOKEN for testing
    testContainer.register(getUserIdToken(), {
      useValue: "test-user-id",
    });

    testContainer.register(AccountFirestoreRepository, {
      useClass: AccountFirestoreRepository,
    });

    repository = testContainer.resolve(AccountFirestoreRepository);
    firestore = mockFirestore;
  });

  afterEach(() => {
    container.clearInstances();
  });

  describe("getAll", () => {
    it("should fetch all accounts and map them to AccountModel", async () => {
      // Arrange
      const mockDocs = [
        { id: "1", data: () => ({ account: "A", balance: 100 }) },
        { id: "2", data: () => ({ account: "B", balance: 200 }) },
      ];
      const getMock = jest.fn().mockResolvedValue({ docs: mockDocs });
      const mockSubcollection = { get: getMock };
      const mockUserDoc = {
        collection: jest.fn().mockReturnValue(mockSubcollection),
      };
      const mockUsersCollection = {
        doc: jest.fn().mockReturnValue(mockUserDoc),
      };
      (firestore.collection as jest.Mock).mockReturnValue(mockUsersCollection);
      const toModelSpy = jest
        .spyOn(AccountAdapter, "toModel")
        .mockImplementation((entity, id) => ({ ...entity, id }));

      // Act
      const result = await repository.getAll();

      // Assert
      expect(firestore.collection).toHaveBeenCalledWith(Collections.Users);
      const usersCollection = firestore.collection(Collections.Users);
      expect(usersCollection.doc).toHaveBeenCalledWith("test-user-id");
      expect(
        usersCollection.doc("test-user-id").collection
      ).toHaveBeenCalledWith(Collections.Accounts);
      expect(getMock).toHaveBeenCalled();
      expect(toModelSpy).toHaveBeenCalledTimes(2);
      expect(result).toEqual([
        { account: "A", balance: 100, id: "1" },
        { account: "B", balance: 200, id: "2" },
      ]);
    });

    it("should return an empty array if no accounts exist", async () => {
      // Arrange
      const getMock = jest.fn().mockResolvedValue({ docs: [] });
      const mockSubcollection = { get: getMock };
      const mockUserDoc = {
        collection: jest.fn().mockReturnValue(mockSubcollection),
      };
      const mockUsersCollection = {
        doc: jest.fn().mockReturnValue(mockUserDoc),
      };
      (firestore.collection as jest.Mock).mockReturnValue(mockUsersCollection);

      // Act
      const result = await repository.getAll();

      // Assert
      expect(firestore.collection).toHaveBeenCalledWith(Collections.Users);
      const usersCollection = firestore.collection(Collections.Users);
      expect(usersCollection.doc).toHaveBeenCalledWith("test-user-id");
      expect(
        usersCollection.doc("test-user-id").collection
      ).toHaveBeenCalledWith(Collections.Accounts);
      expect(result).toEqual([]);
    });
  });

  describe("updateOrCreateAccount", () => {
    it("should update balance if account exists", async () => {
      // Arrange
      const updateMock = jest.fn();
      const mockAccountDoc = {
        data: jest.fn().mockReturnValue({ account: "C1234", balance: 100 }),
        ref: { update: updateMock },
      };
      const mockSubcollection = {
        where: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue({ size: 1, docs: [mockAccountDoc] }),
      };
      const mockUserDoc = {
        collection: jest.fn().mockReturnValue(mockSubcollection),
      };
      jest.spyOn(firestore, "collection").mockReturnValue({
        doc: jest.fn().mockReturnValue(mockUserDoc),
      } as unknown as never);

      // Act
      await repository.updateOrCreateAccount("C1234", -50);

      // Assert
      expect(updateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          account: "C1234",
          balance: 50,
        })
      );
    });

    it("should create account if it does not exist", async () => {
      // Arrange
      const addMock = jest.fn();
      const mockSubcollection = {
        where: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue({ size: 0, docs: [] }),
        add: addMock,
      };
      const mockUserDoc = {
        collection: jest.fn().mockReturnValue(mockSubcollection),
      };
      jest.spyOn(firestore, "collection").mockReturnValue({
        doc: jest.fn().mockReturnValue(mockUserDoc),
      } as unknown as never);

      // Act
      await repository.updateOrCreateAccount("C1234", 200);

      // Assert
      expect(addMock).toHaveBeenCalledWith(
        expect.objectContaining({
          account: "C1234",
          balance: 200,
        })
      );
    });
  });
});
