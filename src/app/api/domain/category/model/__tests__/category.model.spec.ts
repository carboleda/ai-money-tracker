import { CategoryType, categoryAppliesToType } from "../category.model";

describe("categoryAppliesToType", () => {
  it("returns true for any type when restrictedTypes is empty", () => {
    expect(categoryAppliesToType([], CategoryType.EXPENSE)).toBe(true);
    expect(categoryAppliesToType([], CategoryType.INCOME)).toBe(true);
    expect(categoryAppliesToType([], CategoryType.TRANSFER)).toBe(true);
  });

  it("returns true when the single restricted type matches", () => {
    expect(
      categoryAppliesToType([CategoryType.EXPENSE], CategoryType.EXPENSE)
    ).toBe(true);
  });

  it("returns false when the single restricted type does not match", () => {
    expect(
      categoryAppliesToType([CategoryType.EXPENSE], CategoryType.INCOME)
    ).toBe(false);
  });

  it("returns true when the type is one of several restricted types", () => {
    const restrictedTypes = [CategoryType.EXPENSE, CategoryType.INCOME];
    expect(categoryAppliesToType(restrictedTypes, CategoryType.EXPENSE)).toBe(
      true
    );
    expect(categoryAppliesToType(restrictedTypes, CategoryType.INCOME)).toBe(
      true
    );
  });

  it("returns false when the type is not among several restricted types", () => {
    const restrictedTypes = [CategoryType.EXPENSE, CategoryType.INCOME];
    expect(
      categoryAppliesToType(restrictedTypes, CategoryType.TRANSFER)
    ).toBe(false);
  });
});
