import { TransactionAdapter } from "../transaction.adapter";
import {
  TransactionModel,
  TransactionType,
} from "@/app/api/domain/transaction/model/transaction.model";
import { Timestamp } from "firebase-admin/firestore";
import {
  transactionEntityFixture,
  minimalTransactionEntityFixture,
  transferTransactionEntityFixture,
  customCategoryTransactionEntityFixture,
  roundTripTransactionEntityFixture,
} from "./fixtures/transaction.fixture";
import {
  transactionModelFixture,
  minimalTransactionModelFixture,
  transferTransactionModelFixture,
  customCategoryTransactionModelFixture,
  getTransactionModelWithCustomDate,
} from "@/app/api/domain/transaction/service/__tests__/fixtures/transaction.model.fixture";

describe("TransactionAdapter", () => {
  describe("toModel", () => {
    it("should convert TransactionEntity to TransactionModel with all properties", () => {
      const id = "transaction-123";

      const result = TransactionAdapter.toModel(transactionEntityFixture, id);

      expect(result).toBeInstanceOf(TransactionModel);
      expect(result.id).toBe(id);
      expect(result.description).toBe(transactionEntityFixture.description);
      expect(result.paymentLink).toBe(transactionEntityFixture.paymentLink);
      expect(result.notes).toBe(transactionEntityFixture.notes);
      expect(result.type).toBe(transactionEntityFixture.type);
      expect(result.status).toBe(transactionEntityFixture.status);
      expect(result.category).toBe(transactionEntityFixture.category);
      expect(result.sourceAccount.ref).toBe("checking");
      expect(result.destinationAccount?.ref).toBe("savings");
      expect(result.amount).toBe(transactionEntityFixture.amount);
      expect(result.createdAt).toEqual(
        transactionEntityFixture.createdAt.toDate()
      );
      expect(result.isRecurrent).toBe(true);
    });

    it("should convert TransactionEntity to TransactionModel with minimal properties", () => {
      const id = "minimal-transaction-456";

      const result = TransactionAdapter.toModel(
        minimalTransactionEntityFixture,
        id
      );

      expect(result).toBeInstanceOf(TransactionModel);
      expect(result.id).toBe(id);
      expect(result.description).toBe(
        minimalTransactionEntityFixture.description
      );
      expect(result.type).toBe(minimalTransactionEntityFixture.type);
      expect(result.status).toBe(minimalTransactionEntityFixture.status);
      expect(result.sourceAccount).toMatchObject({
        ref: "checking",
      });
      expect(result.amount).toBe(minimalTransactionEntityFixture.amount);
      expect(result.createdAt).toEqual(
        minimalTransactionEntityFixture.createdAt.toDate()
      );
      expect(result.isRecurrent).toBe(false);
      expect(result.paymentLink).toBeUndefined();
      expect(result.notes).toBeUndefined();
      expect(result.category).toBeUndefined();
      expect(result.destinationAccount).toBeUndefined();
    });

    it("should handle custom category string", () => {
      const id = "custom-category-789";

      const result = TransactionAdapter.toModel(
        customCategoryTransactionEntityFixture,
        id
      );

      expect(result.category).toBe("Custom Category");
    });

    it("should handle transfer transaction type", () => {
      const id = "transfer-101";

      const result = TransactionAdapter.toModel(
        transferTransactionEntityFixture,
        id
      );

      expect(result.type).toBe(TransactionType.TRANSFER);
      expect(result.destinationAccount).toMatchObject({
        ref: "savings",
      });
    });
  });

  describe("toEntity", () => {
    it("should convert TransactionModel to TransactionEntity with all properties", () => {
      const result = TransactionAdapter.toEntity(transactionModelFixture);

      expect(result.description).toBe(transactionModelFixture.description);
      expect(result.paymentLink).toBe(transactionModelFixture.paymentLink);
      expect(result.notes).toBe(transactionModelFixture.notes);
      expect(result.type).toBe(transactionModelFixture.type);
      expect(result.status).toBe(transactionModelFixture.status);
      expect(result.category).toBe(transactionModelFixture.category);
      expect(result.sourceAccount).toBe(
        transactionModelFixture.sourceAccount.ref
      );
      expect(result.destinationAccount).toBe(
        transactionModelFixture.destinationAccount?.ref
      );
      expect(result.amount).toBe(transactionModelFixture.amount);
      expect(result.createdAt).toEqual(
        Timestamp.fromDate(transactionModelFixture.createdAt)
      );
      expect(result.isRecurrent).toBe(transactionModelFixture.isRecurrent);
    });

    it("should convert TransactionModel to TransactionEntity with minimal properties", () => {
      const result = TransactionAdapter.toEntity(
        minimalTransactionModelFixture
      );

      expect(result.description).toBe(
        minimalTransactionModelFixture.description
      );
      expect(result.type).toBe(minimalTransactionModelFixture.type);
      expect(result.status).toBe(minimalTransactionModelFixture.status);
      expect(result.sourceAccount).toBe(
        minimalTransactionModelFixture.sourceAccount.ref
      );
      expect(result.amount).toBe(minimalTransactionModelFixture.amount);
      expect(result.createdAt).toEqual(
        Timestamp.fromDate(minimalTransactionModelFixture.createdAt)
      );
      expect(result.paymentLink).toBeUndefined();
      expect(result.notes).toBeUndefined();
      expect(result.category).toBeUndefined();
      expect(result.destinationAccount).toBeUndefined();
      expect(result.isRecurrent).toBe(
        minimalTransactionModelFixture.isRecurrent
      );
    });

    it("should handle custom category string in model", () => {
      const result = TransactionAdapter.toEntity(
        customCategoryTransactionModelFixture
      );

      expect(result.category).toBe("Custom Category");
    });

    it("should handle transfer transaction type in model", () => {
      const result = TransactionAdapter.toEntity(
        transferTransactionModelFixture
      );

      expect(result.type).toBe(TransactionType.TRANSFER);
      expect(result.destinationAccount).toBe("savings");
    });

    it("should handle different date formats correctly", () => {
      const differentDate = new Date("2024-12-25T15:45:30Z");
      const model = getTransactionModelWithCustomDate(differentDate);

      const result = TransactionAdapter.toEntity(model);

      expect(result.createdAt).toEqual(Timestamp.fromDate(differentDate));
    });
  });

  describe("round-trip conversion", () => {
    it("should maintain data integrity through toModel -> toEntity conversion", () => {
      const id = "round-trip-303";

      const model = TransactionAdapter.toModel(
        roundTripTransactionEntityFixture,
        id
      );
      const convertedEntity = TransactionAdapter.toEntity(model);

      expect(convertedEntity.description).toBe(
        roundTripTransactionEntityFixture.description
      );
      expect(convertedEntity.paymentLink).toBe(
        roundTripTransactionEntityFixture.paymentLink
      );
      expect(convertedEntity.notes).toBe(
        roundTripTransactionEntityFixture.notes
      );
      expect(convertedEntity.type).toBe(roundTripTransactionEntityFixture.type);
      expect(convertedEntity.status).toBe(
        roundTripTransactionEntityFixture.status
      );
      expect(convertedEntity.category).toBe(
        roundTripTransactionEntityFixture.category
      );
      expect(convertedEntity.sourceAccount).toBe("checking");
      expect(convertedEntity.destinationAccount).toBe("credit");
      expect(convertedEntity.amount).toBe(
        roundTripTransactionEntityFixture.amount
      );
      expect(convertedEntity.createdAt).toEqual(
        roundTripTransactionEntityFixture.createdAt
      );
    });
  });
});
