/* eslint-disable @typescript-eslint/no-explicit-any */
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

describe("RecurrentExpenseFirestoreRepository", () => {
  let repository: RecurrentExpenseFirestoreRepository;
  let firestore: Firestore;

  beforeEach(() => {
    jest.clearAllMocks();
    const testContainer = container.createChildContainer();

    firestore = {
      collection: jest.fn(),
    } as unknown as Firestore;

    testContainer.register(Firestore, { useValue: firestore });
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
      const mockCollection = {
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

      jest
        .spyOn(firestore, "collection")
        .mockReturnValue(mockCollection as any);
      mockCollection.get.mockResolvedValue(mockSnapshot);

      const result = await repository.getAll();

      expect(firestore.collection).toHaveBeenCalledWith(
        Collections.RecurringExpenses
      );
      expect(mockCollection.orderBy).toHaveBeenCalledWith("dueDate", "asc");
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
      const mockCollection = {
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue(mockDoc),
        }),
      };

      jest
        .spyOn(firestore, "collection")
        .mockReturnValue(mockCollection as any);

      const result = await repository.getById("non-existent-id");

      expect(result).toBeNull();
    });
  });

  describe("create", () => {
    it("should create a new recurring expense", async () => {
      const mockDoc = {
        id: "new-recurrent-expense-id",
        data: jest.fn(),
      };
      const mockCollection = {
        add: jest.fn().mockResolvedValue(mockDoc),
      };

      jest
        .spyOn(firestore, "collection")
        .mockReturnValue(mockCollection as any);

      const result = await repository.create(recurrentExpenseModelFixture);

      expect(firestore.collection).toHaveBeenCalledWith(
        Collections.RecurringExpenses
      );
      expect(mockCollection.add).toHaveBeenCalledWith(
        RecurrentExpenseAdapter.toEntity(recurrentExpenseModelFixture)
      );
      expect(result).toBe(mockDoc.id);
    });
  });

  describe("update", () => {
    it("should update a recurring expense", async () => {
      const mockCollection = {
        doc: jest.fn().mockReturnValue({
          update: jest.fn(),
        }),
      };

      jest
        .spyOn(firestore, "collection")
        .mockReturnValue(mockCollection as any);

      await repository.update(recurrentExpenseModelFixture);

      expect(firestore.collection).toHaveBeenCalledWith(
        Collections.RecurringExpenses
      );
      expect(mockCollection.doc).toHaveBeenCalledWith(
        recurrentExpenseModelFixture.id
      );
      expect(mockCollection.doc().update).toHaveBeenCalledWith(
        RecurrentExpenseAdapter.toEntity(recurrentExpenseModelFixture)
      );
    });
  });

  describe("delete", () => {
    it("should delete a recurring expense", async () => {
      const mockCollection = {
        doc: jest.fn().mockReturnValue({
          delete: jest.fn(),
        }),
      };

      jest
        .spyOn(firestore, "collection")
        .mockReturnValue(mockCollection as any);

      await repository.delete(recurrentExpenseModelFixture.id);

      expect(firestore.collection).toHaveBeenCalledWith(
        Collections.RecurringExpenses
      );
      expect(mockCollection.doc).toHaveBeenCalledWith(
        recurrentExpenseModelFixture.id
      );
      expect(mockCollection.doc().delete).toHaveBeenCalled();
    });
  });
});
