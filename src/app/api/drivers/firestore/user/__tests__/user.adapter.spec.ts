import { UserAdapter } from "../user.adapter";
import { UserEntity } from "../user.entity";

describe("UserAdapter", () => {
  describe("toModel", () => {
    it("should convert Firestore data to UserModel", () => {
      const id = "user123";
      const data: UserEntity = { fcmToken: "token123" };

      const result = UserAdapter.toModel(data, id);

      expect(result).toEqual({
        id,
        fcmToken: data.fcmToken,
      });
    });
  });
});
