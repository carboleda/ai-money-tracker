import "reflect-metadata";
import { container } from "tsyringe";
import { Firestore } from "firebase-admin/firestore";
import { UserFirestoreRepository } from "../user-firestore.repository";
import { Collections } from "@/app/api/drivers/firestore/types";
import { UserModel } from "@/app/api/domain/user/model/user.model";
import { getUserContextToken } from "@/app/api/decorators/tsyringe.decorator";
import type { UserContext } from "@/app/api/context/user-context";

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

    // Register USER_CONTEXT_TOKEN for testing with proper UserContext object
    const testUserContext: UserContext = {
      id: "test-user-id",
      email: "test@example.com",
    };
    testContainer.register(getUserContextToken(), {
      useValue: testUserContext,
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
        data: () => ({ devices: [] }),
      };
      const getMock = jest.fn().mockResolvedValue(mockDoc);
      const docMock = jest.fn().mockReturnValue({ get: getMock });
      (firestore.collection as jest.Mock).mockReturnValue({ doc: docMock });

      const result = await repository.getExistingUser();

      expect(firestore.collection).toHaveBeenCalledWith(Collections.Users);
      expect(docMock).toHaveBeenCalledWith("test-user-id");
      expect(result).toMatchObject({ id: "test-user-id" });
    });
  });

  describe("updateOrCreateUser", () => {
    it("should update existing user and return id", async () => {
      const setMock = jest.fn().mockResolvedValue(undefined);
      const mockDoc = { exists: true, data: () => ({ devices: [] }) };
      const getMock = jest.fn().mockResolvedValue(mockDoc);
      const docMock = jest.fn().mockReturnValue({
        get: getMock,
        set: setMock,
      });
      (firestore.collection as jest.Mock).mockReturnValue({ doc: docMock });

      const user = new UserModel({
        id: "test-user-id",
        email: "test@example.com",
        devices: [
          {
            deviceId: "device-123",
            deviceName: "Chrome on macOS",
          },
        ],
      });

      const result = await repository.updateOrCreateUser(user);

      expect(firestore.collection).toHaveBeenCalledWith(Collections.Users);
      expect(docMock).toHaveBeenCalledWith("test-user-id");
      expect(getMock).toHaveBeenCalled();
      expect(setMock).toHaveBeenCalled();
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

      const user = new UserModel({
        id: "test-user-id",
        email: "newuser@example.com",
        devices: [
          {
            deviceId: "device-456",
            deviceName: "Safari on iPhone",
          },
        ],
      });

      const result = await repository.updateOrCreateUser(user);

      expect(firestore.collection).toHaveBeenCalledWith(Collections.Users);
      expect(docMock).toHaveBeenCalledWith("test-user-id");
      expect(getMock).toHaveBeenCalled();
      expect(setMock).toHaveBeenCalled();
      expect(result).toBe("test-user-id");
    });
  });

  describe("getAllUsers", () => {
    it("should retrieve all users from the collection", async () => {
      const mockUsers = [
        {
          id: "user-1",
          data: () => ({
            id: "user-1",
            email: "user1@example.com",
            devices: [
              {
                deviceId: "device-1",
                deviceName: "Chrome on macOS",
              },
            ],
          }),
        },
        {
          id: "user-2",
          data: () => ({
            id: "user-2",
            email: "user2@example.com",
            devices: [
              {
                deviceId: "device-2",
                deviceName: "Safari on iPhone",
              },
            ],
          }),
        },
      ];
      const getMock = jest.fn().mockResolvedValue({ docs: mockUsers });
      (firestore.collection as jest.Mock).mockReturnValue({ get: getMock });

      const result = await repository.getAllUsers();

      expect(firestore.collection).toHaveBeenCalledWith(Collections.Users);
      expect(getMock).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("user-1");
      expect(result[1].id).toBe("user-2");
    });

    it("should return empty array when no users exist", async () => {
      const getMock = jest.fn().mockResolvedValue({ docs: [] });
      (firestore.collection as jest.Mock).mockReturnValue({ get: getMock });

      const result = await repository.getAllUsers();

      expect(firestore.collection).toHaveBeenCalledWith(Collections.Users);
      expect(getMock).toHaveBeenCalled();
      expect(result).toHaveLength(0);
    });
  });
});
