import "reflect-metadata";
import { RecurringExpenseFirestoreRepository } from "../recurring-expense-firestore.repository";
import {
  RecurringExpenseModel,
  Frequency,
} from "@/app/api/domain/recurring-expense/model/recurring-expense.model";
import { Collections } from "@/app/api/drivers/firestore/types";
import { container } from "tsyringe";
import { Firestore, Timestamp } from "firebase-admin/firestore";
import { recurringExpenseModelFixture } from "./fixtures/recurring-expense.fixture";
import { RecurringExpenseAdapter } from "../recurring-expense.adapter";
import {
  getUserContextToken,
  getRepositoryToken,
} from "@/app/api/decorators/tsyringe.decorator";
import type { UserContext } from "@/app/api/context/user-context";
import { CategoryModel } from "@/app/api/domain/category/model/category.model";
import type { CategoryRepository } from "@/app/api/domain/category/repository/category.repository";

describe("RecurringExpenseFirestoreRepository", () => {
  let repository: RecurringExpenseFirestoreRepository;
  let firestore: Firestore;

  beforeEach(() => {
    jest.clearAllMocks();
    const testContainer = container.createChildContainer();

    firestore = {
      collection: jest.fn().mockReturnValue({
        doc: jest.fn().mockReturnValue({
          collection: jest.fn(),
        }),
      }),
    } as unknown as Firestore;

    testContainer.register(Firestore, { useValue: firestore });

    // Register USER_CONTEXT_TOKEN for testing with proper UserContext object
    const testUserContext: UserContext = {
      id: "test-user-id",
      email: "test@example.com",
    };
    testContainer.register(getUserContextToken(), {
      useValue: testUserContext,
    });

    const mockCategoryRepository: CategoryRepository = {
      getAll: jest.fn().mockResolvedValue([]),
      getById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as CategoryRepository;

    testContainer.register(getRepositoryToken(CategoryModel), {
      useValue: mockCategoryRepository,
    });

    testContainer.register(RecurringExpenseFirestoreRepository, {
      useClass: RecurringExpenseFirestoreRepository,
    });

    repository = testContainer.resolve(RecurringExpenseFirestoreRepository);
  });

  afterEach(() => {
    container.clearInstances();
  });

  describe("getAll", () => {
    it("should return all recurring expenses ordered by due date", async () => {
      const mockSubcollection = {
        orderBy: jest.fn().mockReturnThis(),
        get: jest.fn(),
      };
      const mockSnapshot = {
        docs: [
          {
            id: "1",
            data: () => ({
              description: "Monthly Rent",
              category: "Housing",
              frequency: Frequency.MONTHLY,
              dueDate: Timestamp.fromDate(new Date("2024-01-01")),
              amount: 1000,
              disabled: false,
            }),
          },
        ],
      };
      const mockUserDoc = {
        collection: jest.fn().mockReturnValue(mockSubcollection),
      };
      const mockUsersCollection = {
        doc: jest.fn().mockReturnValue(mockUserDoc),
      };

      jest
        .spyOn(firestore, "collection")
        .mockReturnValue(mockUsersCollection as any);
      mockSubcollection.get.mockResolvedValue(mockSnapshot);

      const result = await repository.getAll();

      expect(firestore.collection).toHaveBeenCalledWith(Collections.Users);
      const usersCollection = firestore.collection(Collections.Users);
      expect(usersCollection.doc).toHaveBeenCalledWith("test-user-id");
      expect(
        usersCollection.doc("test-user-id").collection
      ).toHaveBeenCalledWith(Collections.RecurringExpenses);
      expect(mockSubcollection.orderBy).toHaveBeenCalledWith("dueDate", "asc");
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(RecurringExpenseModel);
    });
  });

  describe("getById", () => {
    it("should return null when document does not exist", async () => {
      const mockDoc = {
        exists: false,
        data: jest.fn(),
      };
      const mockDocRef = {
        get: jest.fn().mockResolvedValue(mockDoc),
      };
      const mockSubcollection = {
        doc: jest.fn().mockReturnValue(mockDocRef),
      };
      const mockUserDoc = {
        collection: jest.fn().mockReturnValue(mockSubcollection),
      };
      const mockUsersCollection = {
        doc: jest.fn().mockReturnValue(mockUserDoc),
      };

      jest
        .spyOn(firestore, "collection")
        .mockReturnValue(mockUsersCollection as any);

      const result = await repository.getById("non-existent-id");

      expect(firestore.collection).toHaveBeenCalledWith(Collections.Users);
      const usersCollection = firestore.collection(Collections.Users);
      expect(usersCollection.doc).toHaveBeenCalledWith("test-user-id");
      expect(
        usersCollection.doc("test-user-id").collection
      ).toHaveBeenCalledWith(Collections.RecurringExpenses);
      expect(result).toBeNull();
    });
  });

  describe("create", () => {
    it("should create a new recurring expense", async () => {
      const mockDoc = {
        id: "new-recurrent-expense-id",
        data: jest.fn(),
      };
      const mockSubcollection = {
        add: jest.fn().mockResolvedValue(mockDoc),
      };
      const mockUserDoc = {
        collection: jest.fn().mockReturnValue(mockSubcollection),
      };
      const mockUsersCollection = {
        doc: jest.fn().mockReturnValue(mockUserDoc),
      };

      jest
        .spyOn(firestore, "collection")
        .mockReturnValue(mockUsersCollection as any);

      const result = await repository.create(recurringExpenseModelFixture);

      expect(firestore.collection).toHaveBeenCalledWith(Collections.Users);
      const usersCollection = firestore.collection(Collections.Users);
      expect(usersCollection.doc).toHaveBeenCalledWith("test-user-id");
      expect(
        usersCollection.doc("test-user-id").collection
      ).toHaveBeenCalledWith(Collections.RecurringExpenses);
      expect(mockSubcollection.add).toHaveBeenCalledWith(
        RecurringExpenseAdapter.toEntity(recurringExpenseModelFixture)
      );
      expect(result).toBe(mockDoc.id);
    });
  });

  describe("update", () => {
    it("should update a recurring expense", async () => {
      const mockDocRef = {
        update: jest.fn(),
      };
      const mockSubcollection = {
        doc: jest.fn().mockReturnValue(mockDocRef),
      };
      const mockUserDoc = {
        collection: jest.fn().mockReturnValue(mockSubcollection),
      };
      const mockUsersCollection = {
        doc: jest.fn().mockReturnValue(mockUserDoc),
      };

      jest
        .spyOn(firestore, "collection")
        .mockReturnValue(mockUsersCollection as any);

      await repository.update(recurringExpenseModelFixture);

      expect(firestore.collection).toHaveBeenCalledWith(Collections.Users);
      const usersCollection = firestore.collection(Collections.Users);
      expect(usersCollection.doc).toHaveBeenCalledWith("test-user-id");
      expect(
        usersCollection.doc("test-user-id").collection
      ).toHaveBeenCalledWith(Collections.RecurringExpenses);
      expect(mockSubcollection.doc).toHaveBeenCalledWith(
        recurringExpenseModelFixture.id
      );
      expect(mockDocRef.update).toHaveBeenCalledWith(
        RecurringExpenseAdapter.toEntity(recurringExpenseModelFixture)
      );
    });
  });

  describe("delete", () => {
    it("should delete a recurring expense", async () => {
      const mockDocRef = {
        delete: jest.fn(),
      };
      const mockSubcollection = {
        doc: jest.fn().mockReturnValue(mockDocRef),
      };
      const mockUserDoc = {
        collection: jest.fn().mockReturnValue(mockSubcollection),
      };
      const mockUsersCollection = {
        doc: jest.fn().mockReturnValue(mockUserDoc),
      };

      jest
        .spyOn(firestore, "collection")
        .mockReturnValue(mockUsersCollection as any);

      await repository.delete(recurringExpenseModelFixture.id);

      expect(firestore.collection).toHaveBeenCalledWith(Collections.Users);
      const usersCollection = firestore.collection(Collections.Users);
      expect(usersCollection.doc).toHaveBeenCalledWith("test-user-id");
      expect(
        usersCollection.doc("test-user-id").collection
      ).toHaveBeenCalledWith(Collections.RecurringExpenses);
      expect(mockSubcollection.doc).toHaveBeenCalledWith(
        recurringExpenseModelFixture.id
      );
      expect(mockDocRef.delete).toHaveBeenCalled();
    });
  });
});
