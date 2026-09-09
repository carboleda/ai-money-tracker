import "reflect-metadata";
import { StandaloneNotificationStrategy } from "../standalone-notification.strategy";
import { getSeveralTransactionModels } from "@/app/api/domain/transaction/service/__tests__/fixtures/transaction.model.fixture";
import {
  TransactionStatus,
  TransactionType,
} from "@/app/api/domain/transaction/model/transaction.model";

describe("StandaloneNotificationStrategy", () => {
  const strategy = new StandaloneNotificationStrategy();

  it("builds an overdue notification for a past due transaction", () => {
    const now = new Date("2024-01-13T00:00:00Z");
    const transactions = getSeveralTransactionModels(1, [
      {
        id: "1",
        createdAt: new Date("2024-01-11T00:00:00Z"),
        description: "Overdue payment",
        status: TransactionStatus.PENDING,
        type: TransactionType.EXPENSE,
      },
    ]);

    const [notification] = strategy.buildNotifications(transactions, now);

    expect(notification).toEqual(
      expect.objectContaining({
        title: "[ACTION REQUIRED]: Payment due",
        body: "Payment for Overdue payment is due 2 days ago, pay it ASAP.",
        extraData: { transactionId: "1" },
      })
    );
  });

  it("builds a due-today notification within the 24h boundary", () => {
    const now = new Date("2024-01-11T12:00:00Z");
    const transactions = getSeveralTransactionModels(1, [
      {
        id: "1",
        createdAt: new Date("2024-01-11T01:00:00Z"),
        description: "Payment due today",
        status: TransactionStatus.PENDING,
        type: TransactionType.EXPENSE,
      },
    ]);

    const [notification] = strategy.buildNotifications(transactions, now);

    expect(notification).toEqual(
      expect.objectContaining({
        title: "[ACTION REQUIRED]: Payment due",
        body: "Payment for Payment due today is due today, pay it ASAP.",
        extraData: { transactionId: "1" },
      })
    );
  });

  it("builds a reminder notification for an upcoming transaction", () => {
    const now = new Date("2024-01-11T00:00:00Z");
    const transactions = getSeveralTransactionModels(1, [
      {
        id: "1",
        createdAt: new Date("2024-01-13T00:00:00Z"),
        description: "Upcoming payment",
        status: TransactionStatus.PENDING,
        type: TransactionType.EXPENSE,
      },
    ]);

    const [notification] = strategy.buildNotifications(transactions, now);

    expect(notification).toEqual(
      expect.objectContaining({
        title: "[REMINDER]: Payment will be due soon",
        body: expect.stringContaining("Payment for Upcoming payment is due on"),
        extraData: { transactionId: "1" },
      })
    );
  });

  it("builds one notification per transaction, preserving order", () => {
    const now = new Date("2024-01-11T00:00:00Z");
    const transactions = getSeveralTransactionModels(2, [
      {
        id: "1",
        createdAt: new Date("2024-01-09T00:00:00Z"),
        description: "First payment",
        status: TransactionStatus.PENDING,
        type: TransactionType.EXPENSE,
      },
      {
        id: "2",
        createdAt: new Date("2024-01-13T00:00:00Z"),
        description: "Second payment",
        status: TransactionStatus.PENDING,
        type: TransactionType.EXPENSE,
      },
    ]);

    const notifications = strategy.buildNotifications(transactions, now);

    expect(notifications).toHaveLength(2);
    expect(notifications[0].extraData).toEqual({ transactionId: "1" });
    expect(notifications[1].extraData).toEqual({ transactionId: "2" });
  });
});
