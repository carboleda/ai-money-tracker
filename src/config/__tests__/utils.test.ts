import { computeBiannualDates } from "../utils";

describe("utils", () => {
  describe("computeBiannualDates", () => {
    it("should return two dates with the second date approximately 6 months after the first", () => {
      const date = new Date("2024-01-15");
      const [first, second] = computeBiannualDates(date);

      expect(first).toEqual(date);
      expect(second.getTime() - first.getTime()).toBeCloseTo(15778800000, -3);
    });

    it("should return dates sorted by month", () => {
      const date = new Date("2024-01-15");
      const [first, second] = computeBiannualDates(date);

      expect(first.getMonth()).toBeLessThanOrEqual(second.getMonth());
    });

    it("should handle dates in the first half of the year", () => {
      const date = new Date("2024-03-20");
      const [first, second] = computeBiannualDates(date);

      expect(first.getMonth()).toBe(2); // March
      expect(second.getMonth()).toBe(8); // September
    });

    it("should handle dates in the second half of the year", () => {
      const date = new Date("2024-09-10");
      const [first, second] = computeBiannualDates(date);

      expect(first.getMonth()).toBe(2); // March (next year)
      expect(second.getMonth()).toBe(8); // September
    });

    it("should return a tuple of exactly two dates", () => {
      const date = new Date("2024-06-01");
      const result = computeBiannualDates(date);

      expect(result).toHaveLength(2);
    });

    it("should handle the end of year correctly", () => {
      const date = new Date("2024-12-31");
      const [first, second] = computeBiannualDates(date);

      expect(second.getMonth()).toBe(11); // December
      expect(first.getMonth()).toBe(6); // June (next year)
    });
  });
});
