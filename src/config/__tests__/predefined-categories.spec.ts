import predefinedCategoriesJson from "../predefined-categories.json";
import {
  CategoryType,
  PredefinedCategory,
} from "@/app/api/domain/category/model/category.model";

describe("predefined-categories.json", () => {
  const categories = predefinedCategoriesJson as PredefinedCategory[];
  const validTypes = Object.values(CategoryType);

  it("has at least one category", () => {
    expect(categories.length).toBeGreaterThan(0);
  });

  it("every entry has the required fields and a valid restrictedTypes array", () => {
    for (const category of categories) {
      expect(typeof category.ref).toBe("string");
      expect(category.ref.length).toBeGreaterThan(0);
      expect(typeof category.name).toBe("string");
      expect(category.name.length).toBeGreaterThan(0);
      expect(typeof category.icon).toBe("string");
      expect(typeof category.color).toBe("string");
      expect(typeof category.description).toBe("string");

      expect(Array.isArray(category.restrictedTypes)).toBe(true);
      for (const type of category.restrictedTypes) {
        expect(validTypes).toContain(type);
      }
    }
  });

  it("has unique refs", () => {
    const refs = categories.map((c) => c.ref);
    expect(new Set(refs).size).toBe(refs.length);
  });

  it("removes INVESTMENT restrictions", () => {
    const investment = categories.find((c) => c.ref === "INVESTMENT");
    expect(investment?.restrictedTypes.sort()).toEqual([].sort());
  });

  it("widens GIFTS to both expense and income", () => {
    const gifts = categories.find((c) => c.ref === "GIFTS");
    expect(gifts?.restrictedTypes.sort()).toEqual(
      [CategoryType.EXPENSE, CategoryType.INCOME].sort(),
    );
  });

  it("leaves OTHER unrestricted", () => {
    const other = categories.find((c) => c.ref === "OTHER");
    expect(other?.restrictedTypes).toEqual([]);
  });
});
