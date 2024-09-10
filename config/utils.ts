import * as env from "@/config/env";
import { Frequency } from "@/interfaces/recurringExpense";

const requiredFields = ["amount", "account"];
const validationRegex =
  /(?<amount>\b\d+\b)|(?<account>\b(C\d{1,4}|[A-Z]{1,5})\b)/g;
const currencyFormater = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});
const monthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
});
const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
});

export const formatCurrency = (amount: number) =>
  currencyFormater.format(amount);

export const formatDate = (date: Date) => dateFormatter.format(date);

export const getMissingFieldsInPrompt = (inputText: string) => {
  const matches = [...inputText.matchAll(validationRegex)];

  return requiredFields.filter((field) => {
    return !matches.some((match) => match.groups && match?.groups?.[field]);
  });
};

export const getAccountName = (account: string) => {
  return env.VALID_ACCOUNTS[account] || "Unknown";
};

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

  const months = computeBiannualDates(date)
    .map((month) => monthFormatter.format(month))
    .join(" and ");

  return `Every 6 months at ${date.getDate()}${daySuffix} in ${months}`;
};
