import { Env } from "@/config/env";
import { Frequency } from "@/interfaces/recurringExpense";
import { TransactionOverdueStatus } from "@/interfaces/transaction";

const requiredFields = ["amount", "account"];
const validationRegex =
  /(?<amount>\b\d+\b)|,\s*(?<account>\b(C\d{1,4}|[A-Z]{1,5})\b)/g;
const currencyFormater = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});
const currencyFormaterNoFractionDigits = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const monthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
});
const monthYearFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
});
const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
});
const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

export const formatCurrency = (amount: number, withFractionDigits = true) =>
  (withFractionDigits
    ? currencyFormater
    : currencyFormaterNoFractionDigits
  ).format(amount);

export const formatTimeDate = (date: Date) => dateTimeFormatter.format(date);

export const formatDate = (date: Date) => dateFormatter.format(date);

export const formatMonthYear = (date: Date) => monthYearFormatter.format(date);

export const getMonthBounds = (date: Date) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

export const getMissingFieldsInPrompt = (inputText: string) => {
  const matches = [...inputText.matchAll(validationRegex)];

  return requiredFields.filter((field) => {
    return !matches.some((match) => match.groups && match?.groups?.[field]);
  });
};

export const getAccountName = (accountId: string) => {
  for (const [key, data] of Object.entries(Env.VALID_ACCOUNTS)) {
    if (key === accountId) {
      return data.label;
    }
  }

  return "Unknown";
};

export const getAccountId = (accountName: string) => {
  for (const [key, data] of Object.entries(Env.VALID_ACCOUNTS)) {
    if (data.label === accountName) {
      return key;
    }
  }

  return "Unknown";
};

export const getAccountList = (skipDisabled = true) => {
  return Object.keys(Env.VALID_ACCOUNTS)
    .filter((key) => {
      if (skipDisabled) {
        return (Env.VALID_ACCOUNTS[key] as any).enabled;
      }

      return true;
    })
    .map((key) => {
      const { label } = Env.VALID_ACCOUNTS[key] as any;
      return { key, label };
    });
};

/**
 * Computes the two biannual dates based on the provided date,
 * adding 6 months (in milliseconds) to the original date.
 * @param date The original date.
 * @returns An array containing the two biannual dates sorted by month.
 */
export const computeBiannualDates = (date: Date): [Date, Date] => {
  return [date, new Date(date.getTime() + 15778800000)].sort(
    (a, b) => a.getMonth() - b.getMonth()
  ) as [Date, Date];
};

export const getEnglishOrdinalSuffix = (date: Date) => {
  // Return the day of the month with its ordinal suffix (e.g., 1st, 2nd, 3rd, 4th)
  return date.getDate() % 10 == 1 && date.getDate() != 11
    ? "st"
    : date.getDate() % 10 == 2 && date.getDate() != 12
    ? "nd"
    : date.getDate() % 10 == 3 && date.getDate() != 13
    ? "rd"
    : "th";
};

export const formatFrequency = (frequency: Frequency, dueDate: string) => {
  const date = new Date(dueDate);
  const daySuffix = getEnglishOrdinalSuffix(date);

  if (frequency === Frequency.Monthly) {
    return `Every month on the ${date.getDate()}${daySuffix}`;
  }

  if (frequency === Frequency.Yearly) {
    return `Every year on ${monthFormatter.format(
      date
    )} ${date.getDate()}${daySuffix}`;
  }

  const day = `${date.getDate()}${daySuffix}`;
  const dates = computeBiannualDates(date)
    .map((month) => `${monthFormatter.format(month)} ${day}`)
    .join(" and ");

  return `Every 6 months on ${dates}`;
};

export const dateDiffInDays = (date1: Date, date2: Date) => {
  const diffInMilliseconds = date2.getTime() - date1.getTime();
  const diffInDays = Math.ceil(diffInMilliseconds / (1000 * 60 * 60 * 24));
  return diffInDays;
};

export const getPreviousMonth = (date?: Date) => {
  const previousMonth = new Date(date ?? new Date());
  previousMonth.setDate(previousMonth.getDate() - 1);
  return previousMonth;
};

export const getTransactionOverdueStatus = (
  date: string
): TransactionOverdueStatus => {
  const now = new Date();
  const dayDiff = dateDiffInDays(now, new Date(date));

  if (dayDiff < 0) {
    return TransactionOverdueStatus.OVERDUE;
  }

  if (dayDiff >= 0 && dayDiff <= 3) {
    return TransactionOverdueStatus.SOON;
  }

  return TransactionOverdueStatus.UPCOMING;
};
