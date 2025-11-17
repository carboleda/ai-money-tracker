export class Utilities {
  /**
   * Computes the two biannual dates based on a given date.
   * Returns an array of two Date objects representing the two biannual occurrences in a year.
   */
  static computeBiannualDates(date: Date): [Date, Date] {
    return [date, new Date(date.getTime() + 15778800000)].sort(
      (a, b) => a.getMonth() - b.getMonth()
    ) as [Date, Date];
  }
}

export const getMonthBounds = (date: Date) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

export const getPreviousMonth = (date?: Date) => {
  const previousMonth = new Date(date ?? new Date());
  previousMonth.setDate(previousMonth.getDate() - previousMonth.getDate());
  return previousMonth;
};
