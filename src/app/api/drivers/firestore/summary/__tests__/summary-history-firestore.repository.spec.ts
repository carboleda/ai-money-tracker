import "reflect-metadata";
import { container } from "tsyringe";
import { SummaryHistoryFirestoreRepository } from "../summary-history-firestore.repository";
import { Firestore } from "firebase-admin/firestore";
import { SummaryHistoryModel } from "@/app/api/domain/summary/model/summary-history.model";
import { Collections } from "@/app/api/drivers/firestore/types";
import { getUserIdToken } from "@/app/api/decorators/tsyringe.decorator";

describe("SummaryHistoryFirestoreRepository", () => {
  let repository: SummaryHistoryFirestoreRepository;
  let firestore: Firestore;

  beforeEach(() => {
    const testContainer = container.createChildContainer();

    const mockFirestore = {
      collection: jest.fn().mockReturnValue({
        add: jest.fn().mockResolvedValue({ id: "mockId" }),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue({
          docs: [
            {
              id: "mockId",
              data: jest.fn().mockReturnValue({
                incomes: 1000,
                expenses: 500,
                transfers: 200,
                createdAt: {
                  toDate: jest.fn().mockReturnValue(new Date("2025-08-01")),
                },
              }),
            },
          ],
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

    repository = testContainer.resolve(SummaryHistoryFirestoreRepository);
    firestore = mockFirestore;
  });

  afterEach(() => {
    container.clearInstances();
  });

  it("should create a summary history and return its ID", async () => {
    const summaryHistory = new SummaryHistoryModel({
      incomes: 1000,
      expenses: 500,
      transfers: 200,
      createdAt: new Date("2025-08-01"),
    });

    const id = await repository.create(summaryHistory);

    expect(id).toBe("mockId");
    expect(firestore.collection).toHaveBeenCalledWith(
      Collections.TransactionsSummaryHistory
    );

    const collectionRef = firestore.collection(
      Collections.TransactionsSummaryHistory
    );
    expect(collectionRef.add).toHaveBeenCalled();
  });

  it("should get history since a specific date", async () => {
    const date = new Date("2025-08-01");

    const history = await repository.getHistorySince(date);

    expect(history).toHaveLength(1);
    expect(history[0]).toEqual(
      expect.objectContaining({
        incomes: 1000,
        expenses: 500,
        transfers: 200,
        createdAt: new Date("2025-08-01"),
      })
    );
    expect(firestore.collection).toHaveBeenCalledWith(
      Collections.TransactionsSummaryHistory
    );
    const collectionRef = firestore.collection(
      Collections.TransactionsSummaryHistory
    );
    expect(collectionRef.where).toHaveBeenCalledWith(
      "createdAt",
      ">=",
      expect.anything()
    );
    expect(collectionRef.orderBy).toHaveBeenCalledWith("createdAt", "asc");
    expect(collectionRef.get).toHaveBeenCalled();
  });
});
