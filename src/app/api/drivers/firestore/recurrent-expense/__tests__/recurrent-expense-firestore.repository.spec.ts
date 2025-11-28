import "reflect-metadata";
import { RecurrentExpenseFirestoreRepository } from "../recurrent-expense-firestore.repository";
import {
  RecurrentExpenseModel,
  Frequency,
} from "@/app/api/domain/recurrent-expense/model/recurrent-expense.model";
import { Collections } from "@/app/api/drivers/firestore/types";
import { container } from "tsyringe";
import { Firestore, Timestamp } from "firebase-admin/firestore";
import { recurrentExpenseModelFixture } from "./fixtures/recurrent-expense.fixture";
import { RecurrentExpenseAdapter } from "../recurrent-expense.adapter";
import { getUserIdToken } from "@/app/api/decorators/tsyringe.decorator";

describe("RecurrentExpenseFirestoreRepository", () => {
  let repository: RecurrentExpenseFirestoreRepository;
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

    // Register USER_ID_TOKEN for testing
    testContainer.register(getUserIdToken(), {
      useValue: "test-user-id",
    });

    testContainer.register(RecurrentExpenseFirestoreRepository, {
      useClass: RecurrentExpenseFirestoreRepository,
    });

    repository = testContainer.resolve(RecurrentExpenseFirestoreRepository);
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
      expect(result[0]).toBeInstanceOf(RecurrentExpenseModel);
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

      const result = await repository.create(recurrentExpenseModelFixture);

      expect(firestore.collection).toHaveBeenCalledWith(Collections.Users);
      const usersCollection = firestore.collection(Collections.Users);
      expect(usersCollection.doc).toHaveBeenCalledWith("test-user-id");
      expect(
        usersCollection.doc("test-user-id").collection
      ).toHaveBeenCalledWith(Collections.RecurringExpenses);
      expect(mockSubcollection.add).toHaveBeenCalledWith(
        RecurrentExpenseAdapter.toEntity(recurrentExpenseModelFixture)
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

      await repository.update(recurrentExpenseModelFixture);

      expect(firestore.collection).toHaveBeenCalledWith(Collections.Users);
      const usersCollection = firestore.collection(Collections.Users);
      expect(usersCollection.doc).toHaveBeenCalledWith("test-user-id");
      expect(
        usersCollection.doc("test-user-id").collection
      ).toHaveBeenCalledWith(Collections.RecurringExpenses);
      expect(mockSubcollection.doc).toHaveBeenCalledWith(
        recurrentExpenseModelFixture.id
      );
      expect(mockDocRef.update).toHaveBeenCalledWith(
        RecurrentExpenseAdapter.toEntity(recurrentExpenseModelFixture)
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

      await repository.delete(recurrentExpenseModelFixture.id);

      expect(firestore.collection).toHaveBeenCalledWith(Collections.Users);
      const usersCollection = firestore.collection(Collections.Users);
      expect(usersCollection.doc).toHaveBeenCalledWith("test-user-id");
      expect(
        usersCollection.doc("test-user-id").collection
      ).toHaveBeenCalledWith(Collections.RecurringExpenses);
      expect(mockSubcollection.doc).toHaveBeenCalledWith(
        recurrentExpenseModelFixture.id
      );
      expect(mockDocRef.delete).toHaveBeenCalled();
    });
  });
});
