import "reflect-metadata";
import { container } from "tsyringe";
import { PendingTransactionNotificationService } from "../pending-transaction-notification.service";
import { FilterTransactionsService } from "@/app/api/domain/transaction/service/filter-transactions.service";
import { GetUserService } from "@/app/api/domain/user/service/get-user.service";
import { NotificationService } from "../notification.service";
import { createUserModelFixture } from "@/app/api/domain/user/service/__tests__/fixtures/user.model.fixture";
import {
  TransactionStatus,
  TransactionType,
} from "@/app/api/domain/transaction/model/transaction.model";
import { getSeveralTransactionModels } from "@/app/api/domain/transaction/service/__tests__/fixtures/transaction.model.fixture";

// Mock the Env module
jest.mock("@/config/env", () => ({
  Env: {
    EARLY_REMINDER_DAYS_AHEAD: 3,
  },
}));

describe("PendingTransactionNotificationService", () => {
  let service: PendingTransactionNotificationService;
  let filterTransactionsService: jest.Mocked<FilterTransactionsService>;
  let getUserService: jest.Mocked<GetUserService>;
  let notificationService: jest.Mocked<NotificationService>;

  beforeEach(() => {
    // Create a child container for each test
    const testContainer = container.createChildContainer();

    // Create mocks
    const mockFilterTransactionsService = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<FilterTransactionsService>;

    const mockGetUserService = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetUserService>;

    const mockNotificationService = {
      sendBulkNotifications: jest.fn(),
    } as unknown as jest.Mocked<NotificationService>;

    // Register mocks in the test container
    testContainer.register(FilterTransactionsService, {
      useValue: mockFilterTransactionsService,
    });
    testContainer.register(GetUserService, {
      useValue: mockGetUserService,
    });
    testContainer.register(NotificationService, {
      useValue: mockNotificationService,
    });

    // Resolve the service from the test container
    service = testContainer.resolve(PendingTransactionNotificationService);
    filterTransactionsService = mockFilterTransactionsService;
    getUserService = mockGetUserService;
    notificationService = mockNotificationService;
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
    container.clearInstances();
  });

  describe("execute", () => {
    it("should return success false when no user found", async () => {
      // Arrange
      getUserService.execute.mockResolvedValue(null);

      // Act
      const result = await service.execute();

      // Assert
      expect(result).toEqual({ success: false });
      expect(filterTransactionsService.execute).not.toHaveBeenCalled();
    });

    it("should return success true when no pending transactions found", async () => {
      // Arrange
      const user = createUserModelFixture();
      getUserService.execute.mockResolvedValue(user);
      filterTransactionsService.execute.mockResolvedValue([]);

      // Act
      const result = await service.execute();

      // Assert
      expect(result).toEqual({
        success: true,
        processedTransactions: 0,
      });
      expect(filterTransactionsService.execute).toHaveBeenCalledWith({
        status: TransactionStatus.PENDING,
      });
    });

    it("should return success true when no transactions meet notification criteria", async () => {
      // Arrange
      jest.useFakeTimers().setSystemTime(new Date("2024-01-11T00:00:00Z"));

      const user = createUserModelFixture();
      const futureDate = new Date("2024-01-21T00:00:00Z"); // 10 days in the future

      const transactions = getSeveralTransactionModels(1, [
        {
          createdAt: futureDate,
          description: "Future payment",
          status: TransactionStatus.PENDING,
          type: TransactionType.EXPENSE,
        },
      ]);

      getUserService.execute.mockResolvedValue(user);
      filterTransactionsService.execute.mockResolvedValue(transactions);

      // Act
      const result = await service.execute();

      // Assert
      expect(result).toEqual({
        success: true,
        processedTransactions: 1,
      });
      expect(result).toBeDefined();
    });

    it("should send notifications for overdue transactions", async () => {
      // Arrange
      jest.useFakeTimers().setSystemTime(new Date("2024-01-13T00:00:00Z"));

      const user = createUserModelFixture();
      const pastDate = new Date("2024-01-11T00:00:00Z"); // 2 days ago

      const transactions = getSeveralTransactionModels(1, [
        {
          createdAt: pastDate,
          description: "Overdue payment",
          status: TransactionStatus.PENDING,
          type: TransactionType.EXPENSE,
        },
      ]);

      getUserService.execute.mockResolvedValue(user);
      filterTransactionsService.execute.mockResolvedValue(transactions);
      notificationService.sendBulkNotifications.mockResolvedValue({
        totalSent: 1,
        successful: 1,
        failed: 0,
        results: [{ success: true, messageId: "msg1" }],
      });

      // Act
      const result = await service.execute();

      // Assert
      expect(notificationService.sendBulkNotifications).toHaveBeenCalledWith([
        {
          userId: user.id,
          fcmToken: user.devices?.[0]?.fcmToken,
          notification: expect.objectContaining({
            title: "[ACTION REQUIRED]: Payment due",
            body: "Payment for Overdue payment is due 2 days ago, pay it ASAP.",
          }),
        },
      ]);
      expect(result).toEqual({
        processedTransactions: 1,
        notificationsSent: 1,
        notificationsFailed: 0,
        success: true,
      });
    });

    it("should send notifications for transactions due today", async () => {
      // Arrange
      jest.useFakeTimers().setSystemTime(new Date("2024-01-11T12:00:00Z"));

      const user = createUserModelFixture();
      const dueToday = new Date("2024-01-11T01:00:00Z");

      const transactions = getSeveralTransactionModels(1, [
        {
          createdAt: dueToday,
          description: "Payment due today",
          status: TransactionStatus.PENDING,
          type: TransactionType.EXPENSE,
        },
      ]);

      getUserService.execute.mockResolvedValue(user);
      filterTransactionsService.execute.mockResolvedValue(transactions);
      notificationService.sendBulkNotifications.mockResolvedValue({
        totalSent: 1,
        successful: 1,
        failed: 0,
        results: [{ success: true, messageId: "msg1" }],
      });

      // Act
      const result = await service.execute();

      // Assert
      expect(notificationService.sendBulkNotifications).toHaveBeenCalledWith([
        {
          userId: user.id,
          fcmToken: user.devices?.[0]?.fcmToken,
          notification: expect.objectContaining({
            title: "[ACTION REQUIRED]: Payment due",
            body: expect.stringMatching(
              /Payment for Payment due today is due (today|0 days ago), pay it ASAP\./
            ),
          }),
        },
      ]);
      expect(result).toEqual({
        processedTransactions: 1,
        notificationsSent: 1,
        notificationsFailed: 0,
        success: true,
      });
    });

    it("should send reminder notifications for upcoming transactions", async () => {
      // Arrange
      jest.useFakeTimers().setSystemTime(new Date("2024-01-11T00:00:00Z"));

      const user = createUserModelFixture();
      const upcomingDate = new Date("2024-01-13T00:00:00Z"); // 2 days from now (within early reminder threshold)

      const transactions = getSeveralTransactionModels(1, [
        {
          createdAt: upcomingDate,
          description: "Upcoming payment",
          status: TransactionStatus.PENDING,
          type: TransactionType.EXPENSE,
        },
      ]);

      getUserService.execute.mockResolvedValue(user);
      filterTransactionsService.execute.mockResolvedValue(transactions);
      notificationService.sendBulkNotifications.mockResolvedValue({
        totalSent: 1,
        successful: 1,
        failed: 0,
        results: [{ success: true, messageId: "msg1" }],
      });

      // Act
      const result = await service.execute();

      // Assert
      expect(notificationService.sendBulkNotifications).toHaveBeenCalledWith([
        {
          userId: user.id,
          fcmToken: user.devices?.[0]?.fcmToken,
          notification: expect.objectContaining({
            title: "[REMINDER]: Payment will be due soon",
            body: expect.stringContaining(
              "Payment for Upcoming payment is due on"
            ),
          }),
        },
      ]);
      expect(result).toEqual({
        processedTransactions: 1,
        notificationsSent: 1,
        notificationsFailed: 0,
        success: true,
      });
    });

    it("should handle notification service failures", async () => {
      // Arrange
      jest.useFakeTimers().setSystemTime(new Date("2024-01-12T00:00:00Z"));

      const user = createUserModelFixture();
      const pastDate = new Date("2024-01-11T00:00:00Z");

      const transactions = getSeveralTransactionModels(1, [
        {
          createdAt: pastDate,
          description: "Test payment",
          status: TransactionStatus.PENDING,
          type: TransactionType.EXPENSE,
        },
      ]);

      getUserService.execute.mockResolvedValue(user);
      filterTransactionsService.execute.mockResolvedValue(transactions);
      notificationService.sendBulkNotifications.mockResolvedValue({
        totalSent: 1,
        successful: 0,
        failed: 1,
        results: [{ success: false, messageId: "" }],
      });

      // Act
      const result = await service.execute();

      // Assert
      expect(result).toEqual({
        processedTransactions: 1,
        notificationsSent: 0,
        notificationsFailed: 1,
        success: true,
      });
      expect(result).toBeDefined();
    });

    it("should handle service exceptions", async () => {
      // Arrange
      getUserService.execute.mockRejectedValue(new Error("Database error"));

      // Act
      const result = await service.execute();

      // Assert
      expect(result).toEqual({ success: false });
    });

    it("should create overdue notification for past due transaction", async () => {
      // Arrange
      jest.useFakeTimers().setSystemTime(new Date("2024-01-11T01:00:00Z"));

      const user = createUserModelFixture();
      const pastDate = new Date("2024-01-10T00:00:00Z");

      const transactions = getSeveralTransactionModels(1, [
        {
          createdAt: pastDate,
          description: "Overdue payment",
          status: TransactionStatus.PENDING,
          type: TransactionType.EXPENSE,
        },
      ]);

      getUserService.execute.mockResolvedValue(user);
      filterTransactionsService.execute.mockResolvedValue(transactions);
      notificationService.sendBulkNotifications.mockResolvedValue({
        totalSent: 1,
        successful: 0,
        failed: 1,
        results: [{ success: false, messageId: "" }],
      });

      // Act
      await service.execute();

      // Assert
      expect(notificationService.sendBulkNotifications).toHaveBeenCalledWith([
        {
          userId: user.id,
          fcmToken: user.devices?.[0]?.fcmToken,
          notification: expect.objectContaining({
            title: "[ACTION REQUIRED]: Payment due",
            body: expect.stringContaining(
              "Payment for Overdue payment is due 1 days ago, pay it ASAP."
            ),
            extraData: expect.objectContaining({
              transactionId: "1",
            }),
          }),
        },
      ]);
    });

    it("should create due today notification", async () => {
      // Arrange
      jest.useFakeTimers().setSystemTime(new Date("2024-01-11T00:00:00Z"));

      const user = createUserModelFixture();
      const now = new Date("2024-01-11T00:00:00Z");
      const transactions = getSeveralTransactionModels(1, [
        {
          createdAt: now,
          description: "Today's payment",
          status: TransactionStatus.PENDING,
          type: TransactionType.EXPENSE,
        },
      ]);

      getUserService.execute.mockResolvedValue(user);
      filterTransactionsService.execute.mockResolvedValue(transactions);
      notificationService.sendBulkNotifications.mockResolvedValue({
        totalSent: 1,
        successful: 0,
        failed: 1,
        results: [{ success: false, messageId: "" }],
      });

      // Act
      await service.execute();

      // Assert
      expect(notificationService.sendBulkNotifications).toHaveBeenCalledWith([
        {
          userId: user.id,
          fcmToken: user.devices?.[0]?.fcmToken,
          notification: expect.objectContaining({
            title: "[ACTION REQUIRED]: Payment due",
            body: expect.stringContaining(
              "Payment for Today's payment is due today, pay it ASAP."
            ),
            extraData: expect.objectContaining({
              transactionId: "1",
            }),
          }),
        },
      ]);
    });

    it("should create reminder notification for upcoming transaction", async () => {
      // Arrange
      jest.useFakeTimers().setSystemTime(new Date("2024-01-11T00:00:00Z"));

      const user = createUserModelFixture();
      const futureDate = new Date("2024-01-13T00:00:00Z");

      const transactions = getSeveralTransactionModels(1, [
        {
          createdAt: futureDate,
          description: "Upcoming payment",
          status: TransactionStatus.PENDING,
          type: TransactionType.EXPENSE,
        },
      ]);

      getUserService.execute.mockResolvedValue(user);
      filterTransactionsService.execute.mockResolvedValue(transactions);
      notificationService.sendBulkNotifications.mockResolvedValue({
        totalSent: 1,
        successful: 0,
        failed: 1,
        results: [{ success: false, messageId: "" }],
      });

      // Act
      await service.execute();

      // Assert
      expect(notificationService.sendBulkNotifications).toHaveBeenCalledWith([
        {
          userId: user.id,
          fcmToken: user.devices?.[0]?.fcmToken,
          notification: expect.objectContaining({
            title: "[REMINDER]: Payment will be due soon",
            body: expect.stringContaining(
              "Payment for Upcoming payment is due on"
            ),
            extraData: expect.objectContaining({
              transactionId: "1",
            }),
          }),
        },
      ]);
    });
  });
});
