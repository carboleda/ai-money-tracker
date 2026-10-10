import "reflect-metadata";
import { container } from "tsyringe";
import { CategoryFirestoreRepository } from "@/app/api/drivers/firestore/category/category-firestore.repository";
import { CategoryAdapter } from "@/app/api/drivers/firestore/category/category.adapter";
import { Collections } from "@/app/api/drivers/firestore/types";
import { Firestore } from "firebase-admin/firestore";
import { getUserContextToken } from "@/app/api/decorators/tsyringe.decorator";
import type { UserContext } from "@/app/api/context/user-context";
import { CategoryModel } from "@/app/api/domain/category/model/category.model";
import type { CreateCategoryInput } from "@/app/api/domain/category/ports/inbound/create-category.port";

describe("CategoryFirestoreRepository", () => {
  let firestore: Firestore;
  let repository: CategoryFirestoreRepository;

  const createInput: CreateCategoryInput = {
    name: "Groceries",
    icon: "🛒",
    color: "#10B981",
    description: "Grocery shopping and food items",
    restrictedTypes: ["expense"] as CategoryModel["restrictedTypes"],
  };

  const mockUserCollection = (subcollection: Record<string, unknown>) => {
    (firestore.collection as jest.Mock).mockReturnValue({
      doc: jest.fn().mockReturnValue({
        collection: jest.fn().mockReturnValue(subcollection),
      }),
    });
  };

  beforeEach(() => {
    const testContainer = container.createChildContainer();

    const mockFirestore = {
      collection: jest.fn(),
    } as unknown as Firestore;

    testContainer.register(Firestore, {
      useValue: mockFirestore,
    });

    const testUserContext: UserContext = {
      id: "test-user-id",
      email: "test@example.com",
    };
    testContainer.register(getUserContextToken(), {
      useValue: testUserContext,
    });

    testContainer.register(CategoryFirestoreRepository, {
      useClass: CategoryFirestoreRepository,
    });

    repository = testContainer.resolve(CategoryFirestoreRepository);
    firestore = mockFirestore;
  });

  afterEach(() => {
    container.clearInstances();
    jest.restoreAllMocks();
  });

  describe("create", () => {
    it("generates a ref and persists a new custom category when none exists yet", async () => {
      const addedDocGet = jest.fn().mockResolvedValue({ id: "doc-1" });
      const addMock = jest.fn().mockResolvedValue({ get: addedDocGet });
      const getMock = jest.fn().mockResolvedValue({ size: 0, docs: [] });
      mockUserCollection({
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        get: getMock,
        add: addMock,
      });

      const id = await repository.create(createInput);

      expect(id).toBe("doc-1");
      expect(addMock).toHaveBeenCalledWith(
        expect.objectContaining({
          name: createInput.name,
          icon: createInput.icon,
          color: createInput.color,
          description: createInput.description,
          restrictedTypes: createInput.restrictedTypes,
          isCustom: true,
          isDeleted: false,
        }),
      );
      const persistedEntity = addMock.mock.calls[0][0];
      expect(typeof persistedEntity.ref).toBe("string");
      expect(persistedEntity.ref).toHaveLength(12);
    });
  });

  describe("createCustomFromPredefined", () => {
    it("persists a new custom category under the predefined category's ref", async () => {
      const addedDocGet = jest.fn().mockResolvedValue({ id: "doc-2" });
      const addMock = jest.fn().mockResolvedValue({ get: addedDocGet });
      const getMock = jest.fn().mockResolvedValue({ size: 0, docs: [] });
      mockUserCollection({
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        get: getMock,
        add: addMock,
      });

      const id = await repository.createCustomFromPredefined(
        "GROCERIES",
        createInput,
      );

      expect(id).toBe("doc-2");
      expect(addMock).toHaveBeenCalledWith(
        expect.objectContaining({
          ref: "GROCERIES",
          name: createInput.name,
          icon: createInput.icon,
          isCustom: true,
          isDeleted: false,
        }),
      );
    });

    it("throws when a category with the given ref already exists", async () => {
      const existingDoc = {
        id: "existing-doc",
        data: () => ({}),
      };
      const getMock = jest
        .fn()
        .mockResolvedValue({ size: 1, docs: [existingDoc] });
      const addMock = jest.fn();
      mockUserCollection({
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        get: getMock,
        add: addMock,
      });
      jest
        .spyOn(CategoryAdapter, "toModel")
        .mockReturnValue({ ref: "GROCERIES" } as CategoryModel);

      await expect(
        repository.createCustomFromPredefined("GROCERIES", createInput),
      ).rejects.toThrow("Category reference 'GROCERIES' already exists");
      expect(addMock).not.toHaveBeenCalled();
    });
  });

  describe("delete", () => {
    it("hard-deletes a customized predefined category since the predefined version remains available", async () => {
      const deleteMock = jest.fn().mockResolvedValue(undefined);
      const updateMock = jest.fn();
      const getMock = jest.fn().mockResolvedValue({
        exists: true,
        data: () => ({
          ref: "GROCERIES",
          isCustom: true,
          isDeleted: false,
          createdAt: { toDate: () => new Date() },
          updatedAt: { toDate: () => new Date() },
        }),
      });
      const docMock = jest.fn().mockReturnValue({
        get: getMock,
        update: updateMock,
        delete: deleteMock,
      });
      mockUserCollection({ doc: docMock });

      await repository.delete("doc-1");

      expect(deleteMock).toHaveBeenCalled();
      expect(updateMock).not.toHaveBeenCalled();
    });

    it("soft-deletes a fully custom category (no predefined counterpart)", async () => {
      const deleteMock = jest.fn();
      const updateMock = jest.fn().mockResolvedValue(undefined);
      const getMock = jest.fn().mockResolvedValue({
        exists: true,
        data: () => ({
          ref: "custom-ref-abc",
          isCustom: true,
          isDeleted: false,
          createdAt: { toDate: () => new Date() },
          updatedAt: { toDate: () => new Date() },
        }),
      });
      const docMock = jest.fn().mockReturnValue({
        get: getMock,
        update: updateMock,
        delete: deleteMock,
      });
      mockUserCollection({ doc: docMock });

      await repository.delete("doc-2");

      expect(updateMock).toHaveBeenCalledWith({ isDeleted: true });
      expect(deleteMock).not.toHaveBeenCalled();
    });

    it("throws when attempting to delete a predefined category", async () => {
      const getMock = jest.fn().mockResolvedValue({
        exists: true,
        data: () => ({
          ref: "GROCERIES",
          isCustom: false,
          isDeleted: false,
          createdAt: { toDate: () => new Date() },
          updatedAt: { toDate: () => new Date() },
        }),
      });
      const docMock = jest.fn().mockReturnValue({ get: getMock });
      mockUserCollection({ doc: docMock });

      await expect(repository.delete("doc-3")).rejects.toThrow(
        "Cannot delete predefined category",
      );
    });
  });

  it("reads/writes the categories subcollection under the current user", async () => {
    const addedDocGet = jest.fn().mockResolvedValue({ id: "doc-3" });
    const addMock = jest.fn().mockResolvedValue({ get: addedDocGet });
    const getMock = jest.fn().mockResolvedValue({ size: 0, docs: [] });
    const docMock = jest.fn().mockReturnValue({
      collection: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        get: getMock,
        add: addMock,
      }),
    });
    (firestore.collection as jest.Mock).mockReturnValue({ doc: docMock });

    await repository.createCustomFromPredefined("GROCERIES", createInput);

    expect(firestore.collection).toHaveBeenCalledWith(Collections.Users);
    expect(docMock).toHaveBeenCalledWith("test-user-id");
  });
});
