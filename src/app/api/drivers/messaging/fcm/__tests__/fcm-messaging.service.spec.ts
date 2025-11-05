import "reflect-metadata";
import { container } from "tsyringe";
import { FcmMessagingService } from "../fcm-messaging.service";
import { getMessaging, TokenMessage } from "firebase-admin/messaging";

// Mock Firebase Admin messaging
jest.mock("firebase-admin/messaging", () => ({
  getMessaging: jest.fn(),
}));

describe("FcmMessagingService", () => {
  let service: FcmMessagingService;
  let mockMessaging: jest.Mocked<{
    send: jest.MockedFunction<(message: TokenMessage) => Promise<string>>;
  }>;

  beforeEach(() => {
    mockMessaging = {
      send: jest.fn(),
    };

    (getMessaging as jest.Mock).mockReturnValue(mockMessaging);

    // Create a child container for each test
    const testContainer = container.createChildContainer();

    // Resolve the service from the test container
    service = testContainer.resolve(FcmMessagingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    container.clearInstances();
  });

  describe("sendMessage", () => {
    it("should send message successfully", async () => {
      // Arrange
      const request = {
        token: "fcm-token-123",
        notification: {
          title: "Test Title",
          body: "Test Body",
        },
        extraData: {
          key: "value",
          transactionId: "tx123",
        },
      };

      const expectedMessageId = "message-id-123";
      mockMessaging.send.mockResolvedValue(expectedMessageId);

      // Act
      const result = await service.sendMessage(request);

      // Assert
      expect(mockMessaging.send).toHaveBeenCalledWith({
        data: {
          title: "Test Title",
          body: "Test Body",
          key: "value",
          transactionId: "tx123",
        },
        token: "fcm-token-123",
      });
      expect(result).toEqual({
        messageId: expectedMessageId,
        success: true,
      });
    });

    it("should handle Firebase messaging errors", async () => {
      // Arrange
      const request = {
        token: "invalid-token",
        notification: {
          title: "Test Title",
          body: "Test Body",
        },
        extraData: {},
      };

      const error = new Error("Invalid registration token");
      mockMessaging.send.mockRejectedValue(error);

      // Act
      const result = await service.sendMessage(request);

      // Assert
      expect(result).toEqual({
        messageId: "",
        success: false,
      });
    });

    it("should handle message with no extra data", async () => {
      // Arrange
      const request = {
        token: "fcm-token-123",
        notification: {
          title: "Simple Title",
          body: "Simple Body",
        },
        extraData: {},
      };

      const expectedMessageId = "message-id-456";
      mockMessaging.send.mockResolvedValue(expectedMessageId);

      // Act
      const result = await service.sendMessage(request);

      // Assert
      expect(mockMessaging.send).toHaveBeenCalledWith({
        data: {
          title: "Simple Title",
          body: "Simple Body",
        },
        token: "fcm-token-123",
      });
      expect(result).toEqual({
        messageId: expectedMessageId,
        success: true,
      });
    });

    it("should merge notification and extra data correctly", async () => {
      // Arrange
      const request = {
        token: "fcm-token-123",
        notification: {
          title: "Notification Title",
          body: "Notification Body",
        },
        extraData: {
          userId: "user123",
          actionType: "payment_reminder",
        },
      };

      mockMessaging.send.mockResolvedValue("msg-id");

      // Act
      await service.sendMessage(request);

      // Assert
      expect(mockMessaging.send).toHaveBeenCalledWith({
        data: {
          title: "Notification Title",
          body: "Notification Body",
          userId: "user123",
          actionType: "payment_reminder",
        },
        token: "fcm-token-123",
      });
    });
  });

  describe("sendMultipleMessages", () => {
    it("should send multiple messages successfully", async () => {
      // Arrange
      const requests = [
        {
          token: "token1",
          notification: { title: "Title 1", body: "Body 1" },
          extraData: { id: "1" },
        },
        {
          token: "token2",
          notification: { title: "Title 2", body: "Body 2" },
          extraData: { id: "2" },
        },
      ];

      mockMessaging.send
        .mockResolvedValueOnce("msg-id-1")
        .mockResolvedValueOnce("msg-id-2");

      // Act
      const results = await service.sendMultipleMessages(requests);

      // Assert
      expect(mockMessaging.send).toHaveBeenCalledTimes(2);
      expect(results).toEqual([
        { messageId: "msg-id-1", success: true },
        { messageId: "msg-id-2", success: true },
      ]);
    });

    it("should handle partial failures in multiple messages", async () => {
      // Arrange
      const requests = [
        {
          token: "valid-token",
          notification: { title: "Title 1", body: "Body 1" },
          extraData: {},
        },
        {
          token: "invalid-token",
          notification: { title: "Title 2", body: "Body 2" },
          extraData: {},
        },
      ];

      mockMessaging.send
        .mockResolvedValueOnce("msg-id-1")
        .mockRejectedValueOnce(new Error("Invalid token"));

      // Act
      const results = await service.sendMultipleMessages(requests);

      // Assert
      expect(results).toEqual([
        { messageId: "msg-id-1", success: true },
        { messageId: "", success: false },
      ]);
    });

    it("should handle all failures in multiple messages", async () => {
      // Arrange
      const requests = [
        {
          token: "invalid-token-1",
          notification: { title: "Title 1", body: "Body 1" },
          extraData: {},
        },
        {
          token: "invalid-token-2",
          notification: { title: "Title 2", body: "Body 2" },
          extraData: {},
        },
      ];

      mockMessaging.send
        .mockRejectedValueOnce(new Error("Invalid token 1"))
        .mockRejectedValueOnce(new Error("Invalid token 2"));

      // Act
      const results = await service.sendMultipleMessages(requests);

      // Assert
      expect(results).toEqual([
        { messageId: "", success: false },
        { messageId: "", success: false },
      ]);
    });

    it("should handle empty requests array", async () => {
      // Arrange
      const requests: Array<{
        token: string;
        notification: { title: string; body: string };
        extraData: Record<string, string>;
      }> = [];

      // Act
      const results = await service.sendMultipleMessages(requests);

      // Assert
      expect(mockMessaging.send).not.toHaveBeenCalled();
      expect(results).toEqual([]);
    });

    it("should process requests independently", async () => {
      // Arrange
      const requests = [
        {
          token: "token1",
          notification: { title: "Title 1", body: "Body 1" },
          extraData: { type: "reminder" },
        },
        {
          token: "token2",
          notification: { title: "Title 2", body: "Body 2" },
          extraData: { type: "alert" },
        },
        {
          token: "token3",
          notification: { title: "Title 3", body: "Body 3" },
          extraData: { type: "info" },
        },
      ];

      mockMessaging.send
        .mockResolvedValueOnce("msg-1")
        .mockRejectedValueOnce(new Error("Network error"))
        .mockResolvedValueOnce("msg-3");

      // Act
      const results = await service.sendMultipleMessages(requests);

      // Assert
      expect(results).toEqual([
        { messageId: "msg-1", success: true },
        { messageId: "", success: false },
        { messageId: "msg-3", success: true },
      ]);
      expect(mockMessaging.send).toHaveBeenCalledTimes(3);
    });
  });
});
