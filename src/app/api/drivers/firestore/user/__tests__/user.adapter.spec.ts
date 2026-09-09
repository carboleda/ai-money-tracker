import { UserAdapter } from "../user.adapter";
import { UserEntity } from "../user.entity";
import { EmailStrategy } from "@/app/api/domain/user/model/user.model";

describe("UserAdapter", () => {
  describe("toModel", () => {
    it("should convert Firestore entity data to UserModel", () => {
      const id = "user123";
      const email = "user@example.com";
      const data: UserEntity = {
        email,
        devices: [
          {
            deviceId: "device-123",
            deviceName: "Chrome on macOS",
            fcmToken: "token123",
          },
        ],
      };

      const result = UserAdapter.toModel(data, id);

      expect(result.id).toBe(id);
      expect(result.email).toBe(email);
      expect(result.devices).toHaveLength(1);
      expect(result.devices?.[0]).toEqual({
        deviceId: "device-123",
        deviceName: "Chrome on macOS",
        fcmToken: "token123",
      });
    });

    it("should handle empty devices array", () => {
      const id = "user456";
      const email = "user456@example.com";
      const data: UserEntity = { email, devices: [] };

      const result = UserAdapter.toModel(data, id);

      expect(result.id).toBe(id);
      expect(result.email).toBe(email);
      expect(result.devices).toHaveLength(0);
    });

    it("should handle undefined devices", () => {
      const id = "user789";
      const email = "user789@example.com";
      const data: UserEntity = { email };

      const result = UserAdapter.toModel(data, id);

      expect(result.id).toBe(id);
      expect(result.email).toBe(email);
      expect(result.devices).toBeUndefined();
    });

    it("should convert settings when present", () => {
      const id = "user123";
      const email = "user@example.com";
      const data: UserEntity = {
        email,
        settings: { emailStrategy: EmailStrategy.DIGEST },
      };

      const result = UserAdapter.toModel(data, id);

      expect(result.settings).toEqual({ emailStrategy: EmailStrategy.DIGEST });
    });

    it("should handle undefined settings", () => {
      const id = "user789";
      const email = "user789@example.com";
      const data: UserEntity = { email };

      const result = UserAdapter.toModel(data, id);

      expect(result.settings).toBeUndefined();
    });
  });

  describe("toEntity", () => {
    it("should convert UserModel to Firestore entity", () => {
      const model = {
        id: "user123",
        email: "user@example.com",
        devices: [
          {
            deviceId: "device-456",
            deviceName: "Safari on iPhone",
            fcmToken: "token456",
          },
        ],
      };

      const result = UserAdapter.toEntity(model);

      expect(result.devices).toHaveLength(1);
      expect(result.devices?.[0]).toEqual({
        deviceId: "device-456",
        deviceName: "Safari on iPhone",
        fcmToken: "token456",
      });
    });

    it("should handle empty devices array when converting to entity", () => {
      const model = {
        id: "user456",
        email: "user2@example.com",
        devices: [],
      };

      const result = UserAdapter.toEntity(model);

      expect(result.devices).toHaveLength(0);
    });

    it("should convert settings when present", () => {
      const model = {
        id: "user123",
        email: "user@example.com",
        devices: [],
        settings: { emailStrategy: EmailStrategy.STANDALONE },
      };

      const result = UserAdapter.toEntity(model);

      expect(result.settings).toEqual({
        emailStrategy: EmailStrategy.STANDALONE,
      });
    });

    it("should handle undefined settings when converting to entity", () => {
      const model = {
        id: "user456",
        email: "user2@example.com",
        devices: [],
      };

      const result = UserAdapter.toEntity(model);

      expect(result.settings).toBeUndefined();
    });
  });
});
