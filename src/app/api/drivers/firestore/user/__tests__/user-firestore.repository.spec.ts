import "reflect-metadata";
import { container } from "tsyringe";
import { Firestore } from "firebase-admin/firestore";
import { UserFirestoreRepository } from "../user-firestore.repository";
import { Collections } from "@/app/api/drivers/firestore/types";
import { UserModel } from "@/app/api/domain/user/model/user.model";
import { getUserIdToken } from "@/app/api/decorators/tsyringe.decorator";

describe("UserFirestoreRepository", () => {
  let firestore: Firestore;
  let repository: UserFirestoreRepository;

  beforeEach(() => {
    const testContainer = container.createChildContainer();

    const mockFirestore = {
      collection: jest.fn().mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: jest.fn(),
          update: jest.fn(),
          set: jest.fn(),
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
      const mockDoc = { exists: false };
      const getMock = jest.fn().mockResolvedValue(mockDoc);
      const docMock = jest.fn().mockReturnValue({ get: getMock });
      (firestore.collection as jest.Mock).mockReturnValue({ doc: docMock });

      const result = await repository.getExistingUser();

      expect(firestore.collection).toHaveBeenCalledWith(Collections.Users);
      expect(docMock).toHaveBeenCalledWith("test-user-id");
      expect(getMock).toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it("should return user model if user exists", async () => {
      const mockDoc = {
        exists: true,
        id: "test-user-id",
        data: () => ({ fcmToken: "token" }),
      };
      const getMock = jest.fn().mockResolvedValue(mockDoc);
      const docMock = jest.fn().mockReturnValue({ get: getMock });
      (firestore.collection as jest.Mock).mockReturnValue({ doc: docMock });

      const result = await repository.getExistingUser();

      expect(firestore.collection).toHaveBeenCalledWith(Collections.Users);
      expect(docMock).toHaveBeenCalledWith("test-user-id");
      expect(result).toEqual({ id: "test-user-id", fcmToken: "token" });
    });
  });

  describe("updateOrCreateUser", () => {
    it("should update existing user and return id", async () => {
      const updateMock = jest.fn().mockResolvedValue(undefined);
      const mockDoc = { exists: true };
      const getMock = jest.fn().mockResolvedValue(mockDoc);
      const docMock = jest.fn().mockReturnValue({
        get: getMock,
        update: updateMock,
      });
      (firestore.collection as jest.Mock).mockReturnValue({ doc: docMock });

      const result = await repository.updateOrCreateUser("newToken");

      expect(firestore.collection).toHaveBeenCalledWith(Collections.Users);
      expect(docMock).toHaveBeenCalledWith("test-user-id");
      expect(getMock).toHaveBeenCalled();
      expect(updateMock).toHaveBeenCalledWith({ fcmToken: "newToken" });
      expect(result).toBe("test-user-id");
    });

    it("should create new user and return id if none exists", async () => {
      const setMock = jest.fn().mockResolvedValue(undefined);
      const mockDoc = { exists: false };
      const getMock = jest.fn().mockResolvedValue(mockDoc);
      const docMock = jest.fn().mockReturnValue({
        get: getMock,
        set: setMock,
      });
      (firestore.collection as jest.Mock).mockReturnValue({ doc: docMock });

      const result = await repository.updateOrCreateUser("token123");

      expect(firestore.collection).toHaveBeenCalledWith(Collections.Users);
      expect(docMock).toHaveBeenCalledWith("test-user-id");
      expect(getMock).toHaveBeenCalled();
      expect(setMock).toHaveBeenCalledWith({ fcmToken: "token123" });
      expect(result).toBe("test-user-id");
    });
  });
});
