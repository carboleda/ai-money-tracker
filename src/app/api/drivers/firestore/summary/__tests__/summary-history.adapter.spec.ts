import { SummaryHistoryAdapter } from "../summary-history.adapter";
import { SummaryHistoryModel } from "@/app/api/domain/summary/model/summary-history.model";
import { Timestamp } from "firebase-admin/firestore";

describe("SummaryHistoryAdapter", () => {
  it("should convert entity to model", () => {
    const entity = {
      incomes: 1000,
      expenses: 500,
      transfers: 200,
      createdAt: Timestamp.fromDate(new Date("2025-08-01")),
    };

    const model = SummaryHistoryAdapter.toModel(entity, "mockId");

    expect(model).toBeInstanceOf(SummaryHistoryModel);
    expect(model).toEqual(
      expect.objectContaining({
        id: "mockId",
        incomes: 1000,
        expenses: 500,
        transfers: 200,
        createdAt: new Date("2025-08-01"),
      })
    );
  });

  it("should convert model to entity", () => {
    const model = new SummaryHistoryModel({
      id: "mockId",
      incomes: 1000,
      expenses: 500,
      transfers: 200,
      createdAt: new Date("2025-08-01"),
    });

    const entity = SummaryHistoryAdapter.toEntity(model);

    expect(entity).toEqual(
      expect.objectContaining({
        incomes: 1000,
        expenses: 500,
        transfers: 200,
        createdAt: expect.any(Timestamp),
      })
    );
    expect(entity.createdAt.toDate()).toEqual(new Date("2025-08-01"));
  });
});
