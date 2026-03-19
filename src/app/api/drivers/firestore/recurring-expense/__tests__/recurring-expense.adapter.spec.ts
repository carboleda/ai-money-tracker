import { RecurringExpenseAdapter } from "../recurring-expense.adapter";
import {
  RecurringExpenseModel,
  Frequency,
} from "@/app/api/domain/recurring-expense/model/recurring-expense.model";
import { RecurringExpenseEntity } from "../recurring-expense.entity";
import { Timestamp } from "firebase-admin/firestore";

describe("RecurringExpenseAdapter", () => {
  describe("toEntity", () => {
    it("should convert RecurringExpenseModel to RecurringExpenseEntity", () => {
      const model = new RecurringExpenseModel({
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

      const entity = RecurringExpenseAdapter.toEntity(model);

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
    it("should convert RecurringExpenseEntity to RecurringExpenseModel", () => {
      const id = "1";
      const entity: RecurringExpenseEntity = {
        description: "Monthly Rent",
        category: "Housing",
        frequency: Frequency.MONTHLY,
        dueDate: Timestamp.fromDate(new Date("2024-01-01")),
        amount: 1000,
        disabled: false,
        paymentLink: "https://example.com",
        notes: "Monthly rent payment",
      };

      const model = RecurringExpenseAdapter.toModel(entity, id);

      expect(model).toBeInstanceOf(RecurringExpenseModel);
      expect(model.id).toBe(id);
      expect(model.description).toBe("Monthly Rent");
      expect(model.category).toEqual({
        ref: "Housing",
        name: "Unknown",
        icon: null,
        color: null,
      });
      expect(model.frequency).toBe(Frequency.MONTHLY);
      expect(model.amount).toBe(1000);
      expect(model.disabled).toBe(false);
      expect(model.paymentLink).toBe("https://example.com");
      expect(model.notes).toBe("Monthly rent payment");
      expect(model.dueDate).toBeInstanceOf(Date);
    });
  });
});
