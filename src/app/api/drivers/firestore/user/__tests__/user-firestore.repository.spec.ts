import "reflect-metadata";
import { container } from "tsyringe";
import { Firestore } from "firebase-admin/firestore";
import { UserFirestoreRepository } from "../user-firestore.repository";
import { Collections } from "@/app/api/drivers/firestore/types";
import { UserModel } from "@/app/api/domain/user/model/user.model";

describe("UserFirestoreRepository", () => {
  let firestore: Firestore;
  let repository: UserFirestoreRepository;

  beforeEach(() => {
    const testContainer = container.createChildContainer();

    const mockFirestore = {
      collection: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnThis(),
        get: jest.fn(),
      }),
    } as unknown as Firestore;

    testContainer.register(Firestore, {
      useValue: mockFirestore,
    });

    testContainer.register(UserFirestoreRepository, {
      useClass: UserFirestoreRepository,
    });

    repository = testContainer.resolve(UserFirestoreRepository);
    firestore = mockFirestore;
  });

  afterEach(() => {
    container.clearInstances();
  });

  describe("getExistingUser", () => {
    it("should return null if no user exists", async () => {
      const getMock = jest.fn().mockResolvedValue({ empty: true });
      const limitMock = jest.fn().mockReturnValue({ get: getMock });
      (firestore.collection as jest.Mock).mockReturnValue({ limit: limitMock });

      const result = await repository.getExistingUser();

      expect(firestore.collection).toHaveBeenCalledWith(Collections.Users);
      expect(limitMock).toHaveBeenCalledWith(1);
      expect(result).toBeNull();
    });

    it("should return user model if user exists", async () => {
      const doc = { id: "user1", data: () => ({ fcmToken: "token" }) };
      const userModel: UserModel = { id: "user1", fcmToken: "token" };
      const getMock = jest
        .fn()
        .mockResolvedValue({ empty: false, docs: [doc] });
      const limitMock = jest.fn().mockReturnValue({ get: getMock });
      (firestore.collection as jest.Mock).mockReturnValue({ limit: limitMock });

      const result = await repository.getExistingUser();

      expect(result).toEqual(userModel);
    });
  });

  describe("updateOrCreateUser", () => {
    it("should update existing user and return id", async () => {
      const update = jest.fn().mockResolvedValue(undefined);
      const doc = { id: "user1", ref: { update } };
      const getMock = jest
        .fn()
        .mockResolvedValue({ empty: false, docs: [doc] });
      const limitMock = jest.fn().mockReturnValue({ get: getMock });
      (firestore.collection as jest.Mock).mockReturnValue({ limit: limitMock });

      const result = await repository.updateOrCreateUser("newToken");

      expect(update).toHaveBeenCalledWith({ fcmToken: "newToken" });
      expect(result).toBe("user1");
    });

    it("should create new user and return new id if none exists", async () => {
      const get = jest.fn().mockResolvedValue({ empty: true });
      const limit = jest.fn().mockReturnValue({ get });
      const add = jest.fn().mockResolvedValue({ id: "newUserId" });
      (firestore.collection as jest.Mock).mockImplementation(() => {
        return {
          limit,
          add,
        };
      });

      const result = await repository.updateOrCreateUser("token123");

      expect(add).toHaveBeenCalledWith({ fcmToken: "token123" });
      expect(result).toBe("newUserId");
    });
  });
});
