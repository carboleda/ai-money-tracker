import {
  classifyTransaction,
  dateDiffInDays,
  dateDiffInHours,
  formatDate,
  isTransactionOverdue,
} from "../transaction-notification-classifier";
import { getSeveralTransactionModels } from "@/app/api/domain/transaction/service/__tests__/fixtures/transaction.model.fixture";
import {
  TransactionStatus,
  TransactionType,
} from "@/app/api/domain/transaction/model/transaction.model";

describe("transaction-notification-classifier", () => {
  describe("isTransactionOverdue", () => {
    it("returns true when createdAt is in the past", () => {
      const now = new Date("2024-01-11T00:00:00Z");
      const createdAt = new Date("2024-01-10T00:00:00Z");
      expect(isTransactionOverdue(now, createdAt)).toBe(true);
    });

    it("returns true when createdAt equals now", () => {
      const now = new Date("2024-01-11T00:00:00Z");
      expect(isTransactionOverdue(now, now)).toBe(true);
    });

    it("returns false when createdAt is in the future", () => {
      const now = new Date("2024-01-11T00:00:00Z");
      const createdAt = new Date("2024-01-13T00:00:00Z");
      expect(isTransactionOverdue(now, createdAt)).toBe(false);
    });
  });

  describe("dateDiffInDays", () => {
    it("computes the absolute day difference between two dates", () => {
      const date1 = new Date("2024-01-13T00:00:00Z");
      const date2 = new Date("2024-01-11T00:00:00Z");
      expect(dateDiffInDays(date1, date2)).toBe(2);
    });
  });

  describe("dateDiffInHours", () => {
    it("computes the absolute hour difference between two dates", () => {
      const date1 = new Date("2024-01-11T12:00:00Z");
      const date2 = new Date("2024-01-11T01:00:00Z");
      expect(dateDiffInHours(date1, date2)).toBe(11);
    });
  });

  describe("formatDate", () => {
    it("formats a date as a long-form US date string", () => {
      expect(formatDate(new Date(2024, 0, 13))).toBe("January 13, 2024");
    });
  });

  describe("classifyTransaction", () => {
    it("classifies an overdue transaction (2 days ago)", () => {
      const now = new Date("2024-01-13T00:00:00Z");
      const [transaction] = getSeveralTransactionModels(1, [
        {
          createdAt: new Date("2024-01-11T00:00:00Z"),
          description: "Overdue payment",
          status: TransactionStatus.PENDING,
          type: TransactionType.EXPENSE,
        },
      ]);

      const result = classifyTransaction(now, transaction);

      expect(result.isOverdue).toBe(true);
      expect(result.daysDifference).toBe(2);
    });

    it("classifies a transaction due today (within 24h boundary) as overdue", () => {
      const now = new Date("2024-01-11T12:00:00Z");
      const [transaction] = getSeveralTransactionModels(1, [
        {
          createdAt: new Date("2024-01-11T01:00:00Z"),
          description: "Payment due today",
          status: TransactionStatus.PENDING,
          type: TransactionType.EXPENSE,
        },
      ]);

      const result = classifyTransaction(now, transaction);

      expect(result.isOverdue).toBe(true);
      expect(result.hoursDifference).toBeLessThanOrEqual(24);
    });

    it("classifies an upcoming transaction as not overdue", () => {
      const now = new Date("2024-01-11T00:00:00Z");
      const [transaction] = getSeveralTransactionModels(1, [
        {
          createdAt: new Date("2024-01-13T00:00:00Z"),
          description: "Upcoming payment",
          status: TransactionStatus.PENDING,
          type: TransactionType.EXPENSE,
        },
      ]);

      const result = classifyTransaction(now, transaction);

      expect(result.isOverdue).toBe(false);
    });
  });
});
