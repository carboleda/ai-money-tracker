import { RecurrentExpenseAdapter } from "../recurrent-expense.adapter";
import { RecurrentExpenseModel, Frequency } from "@/app/api/domain/recurrent-expense/model/recurrent-expense.model";
import { RecurrentExpenseEntity } from "../recurrent-expense.entity";
import { Timestamp } from "firebase-admin/firestore";

describe("RecurrentExpenseAdapter", () => {
  describe("toEntity", () => {
    it("should convert RecurrentExpenseModel to RecurrentExpenseEntity", () => {
      const model = new RecurrentExpenseModel({
        id: "1",
        description: "Monthly Rent",
        category: "Housing",
        frequency: Frequency.MONTHLY,
        dueDate: new Date("2024-01-01"),
        amount: 1000,
        disabled: false,
        paymentLink: "https://example.com",
        notes: "Monthly rent payment",
      });

      const entity = RecurrentExpenseAdapter.toEntity(model);

      expect(entity.description).toBe("Monthly Rent");
      expect(entity.category).toBe("Housing");
      expect(entity.frequency).toBe(Frequency.MONTHLY);
      expect(entity.amount).toBe(1000);
      expect(entity.disabled).toBe(false);
      expect(entity.paymentLink).toBe("https://example.com");
      expect(entity.notes).toBe("Monthly rent payment");
      expect(entity.dueDate).toBeInstanceOf(Timestamp);
    });
  });

  describe("toModel", () => {
    it("should convert RecurrentExpenseEntity to RecurrentExpenseModel", () => {
      const id = "1";
      const entity: RecurrentExpenseEntity = {
        description: "Monthly Rent",
        category: "Housing",
        frequency: Frequency.MONTHLY,
        dueDate: Timestamp.fromDate(new Date("2024-01-01")),
        amount: 1000,
        disabled: false,
        paymentLink: "https://example.com",
        notes: "Monthly rent payment",
      };

      const model = RecurrentExpenseAdapter.toModel(entity, id);

      expect(model).toBeInstanceOf(RecurrentExpenseModel);
      expect(model.id).toBe(id);
      expect(model.description).toBe("Monthly Rent");
      expect(model.category).toBe("Housing");
      expect(model.frequency).toBe(Frequency.MONTHLY);
      expect(model.amount).toBe(1000);
      expect(model.disabled).toBe(false);
      expect(model.paymentLink).toBe("https://example.com");
      expect(model.notes).toBe("Monthly rent payment");
      expect(model.dueDate).toBeInstanceOf(Date);
    });
  });
}); 