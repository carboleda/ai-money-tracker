import { UserAdapter } from "../user.adapter";
import { UserEntity } from "../user.entity";

describe("UserAdapter", () => {
  describe("toModel", () => {
    it("should convert Firestore entity data to UserModel", () => {
      const id = "user123";
      const data: UserEntity = {
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
      expect(result.email).toBe(id);
      expect(result.devices).toHaveLength(1);
      expect(result.devices?.[0]).toEqual({
        deviceId: "device-123",
        deviceName: "Chrome on macOS",
        fcmToken: "token123",
      });
    });

    it("should handle empty devices array", () => {
      const id = "user456";
      const data: UserEntity = { devices: [] };

      const result = UserAdapter.toModel(data, id);

      expect(result.id).toBe(id);
      expect(result.email).toBe(id);
      expect(result.devices).toHaveLength(0);
    });

    it("should handle undefined devices", () => {
      const id = "user789";
      const data: UserEntity = {};

      const result = UserAdapter.toModel(data, id);

      expect(result.id).toBe(id);
      expect(result.email).toBe(id);
      expect(result.devices).toBeUndefined();
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
  });
});
