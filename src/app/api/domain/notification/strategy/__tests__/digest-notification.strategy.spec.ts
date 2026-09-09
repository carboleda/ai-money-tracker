import "reflect-metadata";
import { DigestNotificationStrategy } from "../digest-notification.strategy";
import { getSeveralTransactionModels } from "@/app/api/domain/transaction/service/__tests__/fixtures/transaction.model.fixture";
import {
  TransactionStatus,
  TransactionType,
} from "@/app/api/domain/transaction/model/transaction.model";

describe("DigestNotificationStrategy", () => {
  const strategy = new DigestNotificationStrategy();

  it("returns a single notification regardless of transaction count", () => {
    const now = new Date("2024-01-11T00:00:00Z");
    const transactions = getSeveralTransactionModels(5, [
      {
        createdAt: new Date("2024-01-09T00:00:00Z"),
        status: TransactionStatus.PENDING,
        type: TransactionType.EXPENSE,
      },
    ]);

    const notifications = strategy.buildNotifications(transactions, now);

    expect(notifications).toHaveLength(1);
  });

  it("summarizes overdue and upcoming counts", () => {
    const now = new Date("2024-01-11T00:00:00Z");
    const transactions = getSeveralTransactionModels(3, [
      {
        createdAt: new Date("2024-01-09T00:00:00Z"), // overdue
        status: TransactionStatus.PENDING,
        type: TransactionType.EXPENSE,
      },
      {
        createdAt: new Date("2024-01-10T00:00:00Z"), // overdue
        status: TransactionStatus.PENDING,
        type: TransactionType.EXPENSE,
      },
      {
        createdAt: new Date("2024-01-15T00:00:00Z"), // upcoming
        status: TransactionStatus.PENDING,
        type: TransactionType.EXPENSE,
      },
    ]);

    const [notification] = strategy.buildNotifications(transactions, now);

    expect(notification).toEqual(
      expect.objectContaining({
        title: "[DIGEST]: Pending payments",
        body: "You have 2 overdue and 1 upcoming payments.",
        extraData: {
          type: "digest",
          overdueCount: "2",
          upcomingCount: "1",
        },
      })
    );
  });

  it("returns zero counts for an empty transaction list", () => {
    const now = new Date("2024-01-11T00:00:00Z");

    const [notification] = strategy.buildNotifications([], now);

    expect(notification.extraData).toEqual({
      type: "digest",
      overdueCount: "0",
      upcomingCount: "0",
    });
  });

  it("omits the upcoming count from the body when there are none", () => {
    const now = new Date("2024-01-11T00:00:00Z");
    const transactions = getSeveralTransactionModels(2, [
      {
        createdAt: new Date("2024-01-09T00:00:00Z"), // overdue
        status: TransactionStatus.PENDING,
        type: TransactionType.EXPENSE,
      },
      {
        createdAt: new Date("2024-01-10T00:00:00Z"), // overdue
        status: TransactionStatus.PENDING,
        type: TransactionType.EXPENSE,
      },
    ]);

    const [notification] = strategy.buildNotifications(transactions, now);

    expect(notification.body).toBe("You have 2 overdue payments.");
  });

  it("omits the overdue count from the body when there are none", () => {
    const now = new Date("2024-01-11T00:00:00Z");
    const transactions = getSeveralTransactionModels(1, [
      {
        createdAt: new Date("2024-01-15T00:00:00Z"), // upcoming
        status: TransactionStatus.PENDING,
        type: TransactionType.EXPENSE,
      },
    ]);

    const [notification] = strategy.buildNotifications(transactions, now);

    expect(notification.body).toBe("You have 1 upcoming payments.");
  });
});
