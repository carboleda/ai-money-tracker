import {
  computeBiannualDates,
  getMonthBounds,
  getPreviousMonth,
} from "../utils";

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

  describe("getPreviousMonth", () => {
    it("should return the previous month for a given date when the day is the first day of the month", () => {
      const date = new Date("2024-03-01");
      const previousMonth = getPreviousMonth(date);

      expect(previousMonth.getMonth()).toBe(1); // February
      expect(previousMonth.getFullYear()).toBe(2024);
    });

    it("should return the previous month for a given date when the day is in the middle of the month", () => {
      const date = new Date("2024-03-15");
      const previousMonth = getPreviousMonth(date);

      expect(previousMonth.getMonth()).toBe(1); // February
      expect(previousMonth.getFullYear()).toBe(2024);
    });

    it("should return the previous month for a given date when the day is the last day of the month", () => {
      const date = new Date("2024-02-29");
      const previousMonth = getPreviousMonth(date);

      expect(previousMonth.getMonth()).toBe(0); // January
      expect(previousMonth.getFullYear()).toBe(2024);
    });

    it("should handle year transition correctly", () => {
      const date = new Date("2024-01-10");
      const previousMonth = getPreviousMonth(date);

      expect(previousMonth.getMonth()).toBe(11); // December
      expect(previousMonth.getFullYear()).toBe(2023);
    });
  });

  describe("getMonthBounds", () => {
    it("should return correct start and end dates for a given date object", () => {
      const date = new Date("2026-01-02");
      const { start, end } = getMonthBounds(date);

      expect(start.getFullYear()).toBe(2026);
      expect(start.getMonth()).toBe(0);
      expect(start.getDate()).toBe(1);

      expect(end.getFullYear()).toBe(2026);
      expect(end.getMonth()).toBe(0);
      expect(end.getDate()).toBe(31);
    });

    it("should handle leap years correctly", () => {
      const date = new Date("2024-02-15");
      const { start, end } = getMonthBounds(date);

      expect(start.getFullYear()).toBe(2024);
      expect(start.getMonth()).toBe(1);
      expect(start.getDate()).toBe(1);

      expect(end.getFullYear()).toBe(2024);
      expect(end.getMonth()).toBe(1);
      expect(end.getDate()).toBe(29);
    });
  });
});
