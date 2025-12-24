import "reflect-metadata";
import { container } from "tsyringe";
import { TransactionFirestoreRepository } from "../transaction-firestore.repository";
import { TransactionAdapter } from "../transaction.adapter";
import { Collections } from "@/app/api/drivers/firestore/types";
import { Firestore, Filter } from "firebase-admin/firestore";
import { TransactionStatus } from "@/app/api/domain/transaction/model/transaction.model";
import {
  transactionModelFixture,
  transactionEntityFixture,
} from "./fixtures/transaction.fixture";
import { getUserContextToken } from "@/app/api/decorators/tsyringe.decorator";
import type { UserContext } from "@/app/api/context/user-context";

describe("TransactionFirestoreRepository", () => {
  let firestore: Firestore;
  let repository: TransactionFirestoreRepository;

  beforeEach(() => {
    jest.clearAllMocks();

    const testContainer = container.createChildContainer();

    const mockFirestore = {
      collection: jest.fn().mockReturnValue({
        doc: jest.fn().mockReturnValue({
          collection: jest.fn(),
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

    testContainer.register(TransactionFirestoreRepository, {
      useClass: TransactionFirestoreRepository,
    });

    repository = testContainer.resolve(TransactionFirestoreRepository);
    firestore = mockFirestore;
  });

  afterEach(() => {
    container.clearInstances();
  });

  describe("getById", () => {
    it("should return transaction model when document exists", async () => {
      // Arrange
      const mockDoc = {
        exists: true,
        id: "transaction-123",
        data: () => transactionEntityFixture,
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
      (firestore.collection as jest.Mock).mockReturnValue(mockUsersCollection);

      const toModelSpy = jest.spyOn(TransactionAdapter, "toModel");

      // Act
      const result = await repository.getById("transaction-123");

      // Assert
      expect(firestore.collection).toHaveBeenCalledWith(Collections.Users);
      const usersCollection = firestore.collection(Collections.Users);
      expect(usersCollection.doc).toHaveBeenCalledWith("test-user-id");
      expect(
        usersCollection.doc("test-user-id").collection
      ).toHaveBeenCalledWith(Collections.Transactions);
      expect(mockSubcollection.doc).toHaveBeenCalledWith("transaction-123");
      expect(mockDocRef.get).toHaveBeenCalled();
      expect(toModelSpy).toHaveBeenCalledWith(
        transactionEntityFixture,
        "transaction-123"
      );
      expect(result).toBeDefined();
    });

    it("should return null when document does not exist", async () => {
      // Arrange
      const mockDoc = {
        exists: false,
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
      (firestore.collection as jest.Mock).mockReturnValue(mockUsersCollection);

      // Act
      const result = await repository.getById("non-existent-id");

      // Assert
      expect(firestore.collection).toHaveBeenCalledWith(Collections.Users);
      const usersCollection = firestore.collection(Collections.Users);
      expect(usersCollection.doc).toHaveBeenCalledWith("test-user-id");
      expect(
        usersCollection.doc("test-user-id").collection
      ).toHaveBeenCalledWith(Collections.Transactions);
      expect(result).toBeNull();
    });
  });

  describe("create", () => {
    it("should create transaction and return document id", async () => {
      // Arrange
      const mockDocRef = {
        id: "new-transaction-id",
      };
      const mockSubcollection = {
        add: jest.fn().mockResolvedValue(mockDocRef),
      };
      const mockUserDoc = {
        collection: jest.fn().mockReturnValue(mockSubcollection),
      };
      const mockUsersCollection = {
        doc: jest.fn().mockReturnValue(mockUserDoc),
      };
      (firestore.collection as jest.Mock).mockReturnValue(mockUsersCollection);

      const toEntitySpy = jest.spyOn(TransactionAdapter, "toEntity");

      // Act
      const result = await repository.create(transactionModelFixture);

      // Assert
      expect(firestore.collection).toHaveBeenCalledWith(Collections.Users);
      const usersCollection = firestore.collection(Collections.Users);
      expect(usersCollection.doc).toHaveBeenCalledWith("test-user-id");
      expect(
        usersCollection.doc("test-user-id").collection
      ).toHaveBeenCalledWith(Collections.Transactions);
      expect(toEntitySpy).toHaveBeenCalledWith(transactionModelFixture);
      expect(mockSubcollection.add).toHaveBeenCalledWith(
        expect.objectContaining({
          description: transactionModelFixture.description,
          amount: transactionModelFixture.amount,
        })
      );
      expect(result).toBe("new-transaction-id");
    });
  });

  describe("update", () => {
    it("should update existing transaction", async () => {
      // Arrange
      const mockDocRef = {
        update: jest.fn().mockResolvedValue(undefined),
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
      (firestore.collection as jest.Mock).mockReturnValue(mockUsersCollection);

      const toEntitySpy = jest.spyOn(TransactionAdapter, "toEntity");

      // Act
      await repository.update(transactionModelFixture);

      // Assert
      expect(firestore.collection).toHaveBeenCalledWith(Collections.Users);
      const usersCollection = firestore.collection(Collections.Users);
      expect(usersCollection.doc).toHaveBeenCalledWith("test-user-id");
      expect(
        usersCollection.doc("test-user-id").collection
      ).toHaveBeenCalledWith(Collections.Transactions);
      expect(mockSubcollection.doc).toHaveBeenCalledWith(
        transactionModelFixture.id
      );
      expect(toEntitySpy).toHaveBeenCalledWith(transactionModelFixture);
      expect(mockDocRef.update).toHaveBeenCalledWith(
        expect.objectContaining({
          description: transactionModelFixture.description,
          amount: transactionModelFixture.amount,
        })
      );
    });
  });

  describe("delete", () => {
    it("should delete transaction by id", async () => {
      // Arrange
      const mockDocRef = {
        delete: jest.fn().mockResolvedValue(undefined),
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
      (firestore.collection as jest.Mock).mockReturnValue(mockUsersCollection);

      // Act
      await repository.delete("transaction-123");

      // Assert
      expect(firestore.collection).toHaveBeenCalledWith(Collections.Users);
      const usersCollection = firestore.collection(Collections.Users);
      expect(usersCollection.doc).toHaveBeenCalledWith("test-user-id");
      expect(
        usersCollection.doc("test-user-id").collection
      ).toHaveBeenCalledWith(Collections.Transactions);
      expect(mockSubcollection.doc).toHaveBeenCalledWith("transaction-123");
      expect(mockDocRef.delete).toHaveBeenCalled();
    });
  });

  describe("searchTransactions", () => {
    it("should search transactions with all filter parameters", async () => {
      // Arrange
      const mockDocs = [
        { id: "1", data: () => transactionEntityFixture },
        { id: "2", data: () => transactionEntityFixture },
      ];
      const mockSnapshot = {
        docs: mockDocs,
      };
      const mockQuery = {
        orderBy: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue(mockSnapshot),
      };
      const mockSubcollection = {
        orderBy: jest.fn().mockReturnValue(mockQuery),
      };
      const mockUserDoc = {
        collection: jest.fn().mockReturnValue(mockSubcollection),
      };
      const mockUsersCollection = {
        doc: jest.fn().mockReturnValue(mockUserDoc),
      };
      (firestore.collection as jest.Mock).mockReturnValue(mockUsersCollection);

      const toModelSpy = jest.spyOn(TransactionAdapter, "toModel");
      const filterParams = {
        status: TransactionStatus.COMPLETE,
        account: "checking",
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-01-31"),
      };

      // Act
      const result = await repository.searchTransactions(filterParams);

      // Assert
      expect(firestore.collection).toHaveBeenCalledWith(Collections.Users);
      const usersCollection = firestore.collection(Collections.Users);
      expect(usersCollection.doc).toHaveBeenCalledWith("test-user-id");
      expect(
        usersCollection.doc("test-user-id").collection
      ).toHaveBeenCalledWith(Collections.Transactions);
      expect(mockSubcollection.orderBy).toHaveBeenCalledWith(
        "createdAt",
        "desc"
      );
      expect(mockQuery.where).toHaveBeenCalledWith(
        "createdAt",
        ">=",
        filterParams.startDate
      );
      expect(mockQuery.where).toHaveBeenCalledWith(
        "createdAt",
        "<=",
        filterParams.endDate
      );
      expect(mockQuery.where).toHaveBeenCalledWith(
        Filter.and(
          Filter.or(
            Filter.where("sourceAccount", "==", "checking"),
            Filter.where("destinationAccount", "==", "checking")
          )
        )
      );
      expect(toModelSpy).toHaveBeenCalledTimes(2);
      expect(result).toHaveLength(2);
    });

    it("should search transactions with pending status (ascending order)", async () => {
      // Arrange
      const mockDocs = [{ id: "1", data: () => transactionEntityFixture }];
      const mockSnapshot = { docs: mockDocs };
      const mockQuery = {
        orderBy: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue(mockSnapshot),
      };
      const mockSubcollection = {
        orderBy: jest.fn().mockReturnValue(mockQuery),
      };
      const mockUserDoc = {
        collection: jest.fn().mockReturnValue(mockSubcollection),
      };
      const mockUsersCollection = {
        doc: jest.fn().mockReturnValue(mockUserDoc),
      };
      (firestore.collection as jest.Mock).mockReturnValue(mockUsersCollection);

      const filterParams = {
        status: TransactionStatus.PENDING,
      };

      // Act
      await repository.searchTransactions(filterParams);

      // Assert
      expect(firestore.collection).toHaveBeenCalledWith(Collections.Users);
      const usersCollection = firestore.collection(Collections.Users);
      expect(usersCollection.doc).toHaveBeenCalledWith("test-user-id");
      expect(
        usersCollection.doc("test-user-id").collection
      ).toHaveBeenCalledWith(Collections.Transactions);
      expect(mockSubcollection.orderBy).toHaveBeenCalledWith(
        "createdAt",
        "asc"
      );
    });

    it("should search transactions without date filters", async () => {
      // Arrange
      const mockDocs = [{ id: "1", data: () => transactionEntityFixture }];
      const mockSnapshot = { docs: mockDocs };
      const mockQuery = {
        orderBy: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue(mockSnapshot),
        where: jest.fn().mockReturnThis(),
      };
      const mockSubcollection = {
        orderBy: jest.fn().mockReturnValue(mockQuery),
      };
      const mockUserDoc = {
        collection: jest.fn().mockReturnValue(mockSubcollection),
      };
      const mockUsersCollection = {
        doc: jest.fn().mockReturnValue(mockUserDoc),
      };
      (firestore.collection as jest.Mock).mockReturnValue(mockUsersCollection);

      const filterParams = {
        status: TransactionStatus.COMPLETE,
        account: "checking",
      };

      // Act
      await repository.searchTransactions(filterParams);

      // Assert
      expect(firestore.collection).toHaveBeenCalledWith(Collections.Users);
      const usersCollection = firestore.collection(Collections.Users);
      expect(usersCollection.doc).toHaveBeenCalledWith("test-user-id");
      expect(
        usersCollection.doc("test-user-id").collection
      ).toHaveBeenCalledWith(Collections.Transactions);
      expect(mockQuery.where).toHaveBeenCalledWith(
        Filter.and(
          Filter.or(
            Filter.where("sourceAccount", "==", "checking"),
            Filter.where("destinationAccount", "==", "checking")
          )
        )
      );
    });

    it("should search transactions without account filter", async () => {
      // Arrange
      const mockDocs = [{ id: "1", data: () => transactionEntityFixture }];
      const mockSnapshot = { docs: mockDocs };
      const mockQuery = {
        orderBy: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue(mockSnapshot),
      };
      const mockSubcollection = {
        orderBy: jest.fn().mockReturnValue(mockQuery),
      };
      const mockUserDoc = {
        collection: jest.fn().mockReturnValue(mockSubcollection),
      };
      const mockUsersCollection = {
        doc: jest.fn().mockReturnValue(mockUserDoc),
      };
      (firestore.collection as jest.Mock).mockReturnValue(mockUsersCollection);

      const filterParams = {
        status: TransactionStatus.COMPLETE,
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-01-31"),
      };

      // Act
      await repository.searchTransactions(filterParams);

      // Assert
      expect(firestore.collection).toHaveBeenCalledWith(Collections.Users);
      const usersCollection = firestore.collection(Collections.Users);
      expect(usersCollection.doc).toHaveBeenCalledWith("test-user-id");
      expect(
        usersCollection.doc("test-user-id").collection
      ).toHaveBeenCalledWith(Collections.Transactions);
      expect(mockQuery.where).toHaveBeenCalledWith(
        "createdAt",
        ">=",
        filterParams.startDate
      );
      expect(mockQuery.where).toHaveBeenCalledWith(
        "createdAt",
        "<=",
        filterParams.endDate
      );
      // Should not call account filter
      expect(mockQuery.where).not.toHaveBeenCalledWith(
        expect.objectContaining({
          sourceAccount: expect.anything(),
        })
      );
    });

    it("should return empty array when no transactions found", async () => {
      // Arrange
      const mockSnapshot = { docs: [] };
      const mockQuery = {
        orderBy: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue(mockSnapshot),
      };
      const mockSubcollection = {
        orderBy: jest.fn().mockReturnValue(mockQuery),
      };
      const mockUserDoc = {
        collection: jest.fn().mockReturnValue(mockSubcollection),
      };
      const mockUsersCollection = {
        doc: jest.fn().mockReturnValue(mockUserDoc),
      };
      (firestore.collection as jest.Mock).mockReturnValue(mockUsersCollection);

      const filterParams = {
        status: TransactionStatus.COMPLETE,
      };

      // Act
      const result = await repository.searchTransactions(filterParams);

      // Assert
      expect(firestore.collection).toHaveBeenCalledWith(Collections.Users);
      const usersCollection = firestore.collection(Collections.Users);
      expect(usersCollection.doc).toHaveBeenCalledWith("test-user-id");
      expect(
        usersCollection.doc("test-user-id").collection
      ).toHaveBeenCalledWith(Collections.Transactions);
      expect(result).toEqual([]);
    });
  });
});
