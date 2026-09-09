import "reflect-metadata";
import { container } from "tsyringe";
import { PendingTransactionNotificationService } from "../pending-transaction-notification.service";
import { FilterTransactionsService } from "@/app/api/domain/transaction/service/filter-transactions.service";
import { GetUserService } from "@/app/api/domain/user/service/get-user.service";
import { NotificationService } from "../notification.service";
import { StandaloneNotificationStrategy } from "../../strategy/standalone-notification.strategy";
import { DigestNotificationStrategy } from "../../strategy/digest-notification.strategy";
import { NotificationModel } from "../../model/notification.model";
import { createUserModelFixture } from "@/app/api/domain/user/service/__tests__/fixtures/user.model.fixture";
import { EmailStrategy } from "@/app/api/domain/user/model/user.model";
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
  let standaloneNotificationStrategy: jest.Mocked<StandaloneNotificationStrategy>;
  let digestNotificationStrategy: jest.Mocked<DigestNotificationStrategy>;

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

    const mockStandaloneNotificationStrategy = {
      buildNotifications: jest.fn().mockReturnValue([]),
    } as unknown as jest.Mocked<StandaloneNotificationStrategy>;

    const mockDigestNotificationStrategy = {
      buildNotifications: jest.fn().mockReturnValue([]),
    } as unknown as jest.Mocked<DigestNotificationStrategy>;

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
    testContainer.register(StandaloneNotificationStrategy, {
      useValue: mockStandaloneNotificationStrategy,
    });
    testContainer.register(DigestNotificationStrategy, {
      useValue: mockDigestNotificationStrategy,
    });

    // Resolve the service from the test container
    service = testContainer.resolve(PendingTransactionNotificationService);
    filterTransactionsService = mockFilterTransactionsService;
    getUserService = mockGetUserService;
    notificationService = mockNotificationService;
    standaloneNotificationStrategy = mockStandaloneNotificationStrategy;
    digestNotificationStrategy = mockDigestNotificationStrategy;
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
      expect(standaloneNotificationStrategy.buildNotifications).not.toHaveBeenCalled();
      expect(digestNotificationStrategy.buildNotifications).not.toHaveBeenCalled();
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
      standaloneNotificationStrategy.buildNotifications.mockReturnValue([
        new NotificationModel({ title: "t", body: "b" }),
      ]);
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
    });

    it("should handle service exceptions", async () => {
      // Arrange
      getUserService.execute.mockRejectedValue(new Error("Database error"));

      // Act
      const result = await service.execute();

      // Assert
      expect(result).toEqual({ success: false });
    });

    describe("strategy selection", () => {
      const setUpTransactionsToNotify = () => {
        jest.useFakeTimers().setSystemTime(new Date("2024-01-11T00:00:00Z"));
        const transactions = getSeveralTransactionModels(1, [
          {
            createdAt: new Date("2024-01-10T00:00:00Z"),
            description: "Overdue payment",
            status: TransactionStatus.PENDING,
            type: TransactionType.EXPENSE,
          },
        ]);
        filterTransactionsService.execute.mockResolvedValue(transactions);
        notificationService.sendBulkNotifications.mockResolvedValue({
          totalSent: 1,
          successful: 1,
          failed: 0,
          results: [{ success: true, messageId: "msg1" }],
        });
      };

      it("uses StandaloneNotificationStrategy when user.settings is undefined", async () => {
        setUpTransactionsToNotify();
        const user = createUserModelFixture();
        getUserService.execute.mockResolvedValue(user);
        standaloneNotificationStrategy.buildNotifications.mockReturnValue([
          new NotificationModel({ title: "standalone", body: "b" }),
        ]);

        await service.execute();

        expect(standaloneNotificationStrategy.buildNotifications).toHaveBeenCalled();
        expect(digestNotificationStrategy.buildNotifications).not.toHaveBeenCalled();
      });

      it("uses StandaloneNotificationStrategy when emailStrategy is STANDALONE", async () => {
        setUpTransactionsToNotify();
        const user = createUserModelFixture({
          settings: { emailStrategy: EmailStrategy.STANDALONE },
        });
        getUserService.execute.mockResolvedValue(user);
        standaloneNotificationStrategy.buildNotifications.mockReturnValue([
          new NotificationModel({ title: "standalone", body: "b" }),
        ]);

        await service.execute();

        expect(standaloneNotificationStrategy.buildNotifications).toHaveBeenCalled();
        expect(digestNotificationStrategy.buildNotifications).not.toHaveBeenCalled();
      });

      it("uses DigestNotificationStrategy when emailStrategy is DIGEST", async () => {
        setUpTransactionsToNotify();
        const user = createUserModelFixture({
          settings: { emailStrategy: EmailStrategy.DIGEST },
        });
        getUserService.execute.mockResolvedValue(user);
        digestNotificationStrategy.buildNotifications.mockReturnValue([
          new NotificationModel({ title: "digest", body: "b" }),
        ]);

        await service.execute();

        expect(digestNotificationStrategy.buildNotifications).toHaveBeenCalled();
        expect(standaloneNotificationStrategy.buildNotifications).not.toHaveBeenCalled();
      });

      it("fans the strategy's notifications out to every device with an fcmToken", async () => {
        setUpTransactionsToNotify();
        const user = createUserModelFixture({
          devices: [
            { deviceId: "dev1", deviceName: "Device 1", fcmToken: "token1" },
            { deviceId: "dev2", deviceName: "Device 2", fcmToken: "token2" },
          ],
          settings: { emailStrategy: EmailStrategy.DIGEST },
        });
        getUserService.execute.mockResolvedValue(user);
        const notification = new NotificationModel({
          title: "[DIGEST]: Pending payments",
          body: "You have 1 overdue payments.",
          extraData: { type: "digest", overdueCount: "1", upcomingCount: "0" },
        });
        digestNotificationStrategy.buildNotifications.mockReturnValue([
          notification,
        ]);

        await service.execute();

        expect(notificationService.sendBulkNotifications).toHaveBeenCalledWith([
          { userId: user.id, fcmToken: "token1", notification },
          { userId: user.id, fcmToken: "token2", notification },
        ]);
      });
    });
  });
});
