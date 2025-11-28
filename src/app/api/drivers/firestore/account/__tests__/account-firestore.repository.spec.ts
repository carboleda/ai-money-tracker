import "reflect-metadata";
import { container } from "tsyringe";
import { AccountFirestoreRepository } from "@/app/api/drivers/firestore/account/account-firestore.repository";
import { AccountAdapter } from "@/app/api/drivers/firestore/account/account.adapter";
import { Collections } from "@/app/api/drivers/firestore/types";
import { Firestore } from "firebase-admin/firestore";

describe("AccountFirestoreRepository", () => {
  let firestore: Firestore;
  let repository: AccountFirestoreRepository;

  beforeEach(() => {
    const testContainer = container.createChildContainer();

    const mockFirestore = {
      collection: jest.fn().mockReturnValue({
        get: jest.fn(),
        where: jest.fn().mockReturnThis(),
        doc: jest.fn().mockReturnThis(),
      }),
    } as unknown as Firestore;

    testContainer.register(Firestore, {
      useValue: mockFirestore,
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
      (firestore.collection as jest.Mock).mockReturnValue({ get: getMock });
      const toModelSpy = jest
        .spyOn(AccountAdapter, "toModel")
        .mockImplementation((entity, id) => ({ ...entity, id }));

      // Act
      const result = await repository.getAll();

      // Assert
      expect(firestore.collection).toHaveBeenCalledWith(Collections.Accounts);
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
      (firestore.collection as jest.Mock).mockReturnValue({ get: getMock });

      // Act
      const result = await repository.getAll();

      // Assert
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
      jest.spyOn(firestore, "collection").mockReturnValue({
        where: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue({ size: 1, docs: [mockAccountDoc] }),
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
      jest.spyOn(firestore, "collection").mockReturnValue({
        where: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue({ size: 0, docs: [] }),
        add: addMock,
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
