import "reflect-metadata";
import { container } from "tsyringe";
import { NotificationService } from "../notification.service";
import { MessagingService } from "@/app/api/domain/shared/ports/messaging.interface";
import { NotificationModel } from "../../model/notification.model";

describe("NotificationService", () => {
  let service: NotificationService;
  let messagingService: jest.Mocked<MessagingService>;

  beforeEach(() => {
    // Create a child container for each test
    const testContainer = container.createChildContainer();

    const mockMessagingService = {
      sendMessage: jest.fn(),
      sendMultipleMessages: jest.fn(),
    };

    // Register mocks in the test container
    testContainer.register<MessagingService>("MessagingService", {
      useValue: mockMessagingService,
    });

    // Resolve the service from the test container
    service = testContainer.resolve(NotificationService);
    messagingService = mockMessagingService as jest.Mocked<MessagingService>;
  });

  afterEach(() => {
    // Clean up
    container.clearInstances();
  });

  describe("sendNotification", () => {
    it("should send notification successfully", async () => {
      // Arrange
      const userId = "user123";
      const fcmToken = "fcm-token-123";
      const notification = new NotificationModel({
        title: "Test Title",
        body: "Test Body",
        extraData: { key: "value" },
      });

      messagingService.sendMessage.mockResolvedValue({
        success: true,
        messageId: "message-123",
      });

      // Act
      const result = await service.sendNotification(
        userId,
        fcmToken,
        notification
      );

      // Assert
      expect(messagingService.sendMessage).toHaveBeenCalledWith({
        token: fcmToken,
        notification: {
          title: notification.title,
          body: notification.body,
        },
        extraData: notification.extraData,
      });
      expect(result).toEqual({
        success: true,
        messageId: "message-123",
      });
    });

    it("should handle messaging service failure", async () => {
      // Arrange
      const userId = "user123";
      const fcmToken = "fcm-token-123";
      const notification = new NotificationModel({
        title: "Test Title",
        body: "Test Body",
      });

      messagingService.sendMessage.mockResolvedValue({
        success: false,
        messageId: "",
      });

      // Act
      const result = await service.sendNotification(
        userId,
        fcmToken,
        notification
      );

      // Assert
      expect(result).toEqual({
        success: false,
        messageId: "",
      });
    });

    it("should handle messaging service exception", async () => {
      // Arrange
      const userId = "user123";
      const fcmToken = "fcm-token-123";
      const notification = new NotificationModel({
        title: "Test Title",
        body: "Test Body",
      });

      const error = new Error("Network error");
      messagingService.sendMessage.mockRejectedValue(error);

      // Act
      const result = await service.sendNotification(
        userId,
        fcmToken,
        notification
      );

      // Assert
      expect(result).toEqual({
        success: false,
        error: "Network error",
      });
    });
  });

  describe("sendBulkNotifications", () => {
    it("should send multiple notifications successfully", async () => {
      // Arrange
      const notifications = [
        {
          userId: "user1",
          fcmToken: "token1",
          notification: new NotificationModel({
            title: "Title 1",
            body: "Body 1",
          }),
        },
        {
          userId: "user2",
          fcmToken: "token2",
          notification: new NotificationModel({
            title: "Title 2",
            body: "Body 2",
          }),
        },
      ];

      messagingService.sendMultipleMessages.mockResolvedValue([
        { success: true, messageId: "msg1" },
        { success: true, messageId: "msg2" },
      ]);

      // Act
      const result = await service.sendBulkNotifications(notifications);

      // Assert
      expect(messagingService.sendMultipleMessages).toHaveBeenCalledWith([
        {
          token: "token1",
          notification: { title: "Title 1", body: "Body 1" },
          extraData: undefined,
        },
        {
          token: "token2",
          notification: { title: "Title 2", body: "Body 2" },
          extraData: undefined,
        },
      ]);
      expect(result).toEqual({
        totalSent: 2,
        successful: 2,
        failed: 0,
        results: [
          { success: true, messageId: "msg1" },
          { success: true, messageId: "msg2" },
        ],
      });
    });

    it("should handle partial failures in bulk notifications", async () => {
      // Arrange
      const notifications = [
        {
          userId: "user1",
          fcmToken: "token1",
          notification: new NotificationModel({
            title: "Title 1",
            body: "Body 1",
          }),
        },
        {
          userId: "user2",
          fcmToken: "token2",
          notification: new NotificationModel({
            title: "Title 2",
            body: "Body 2",
          }),
        },
      ];

      messagingService.sendMultipleMessages.mockResolvedValue([
        { success: true, messageId: "msg1" },
        { success: false, messageId: "" },
      ]);

      // Act
      const result = await service.sendBulkNotifications(notifications);

      // Assert
      expect(result).toEqual({
        totalSent: 2,
        successful: 1,
        failed: 1,
        results: [
          { success: true, messageId: "msg1" },
          { success: false, messageId: "" },
        ],
      });
    });

    it("should handle empty notifications array", async () => {
      // Arrange
      const notifications: Array<{
        userId: string;
        fcmToken: string;
        notification: NotificationModel;
      }> = [];

      messagingService.sendMultipleMessages.mockResolvedValue([]);

      // Act
      const result = await service.sendBulkNotifications(notifications);

      // Assert
      expect(result).toEqual({
        totalSent: 0,
        successful: 0,
        failed: 0,
        results: [],
      });
    });
  });
});
