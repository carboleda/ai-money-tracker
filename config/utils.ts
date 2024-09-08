import * as env from "@/config/env";

const requiredFields = ["amount", "account"];
const validationRegex =
  /(?<amount>\b\d+\b)|(?<account>\b(C\d{1,4}|[A-Z]{1,5})\b)/g;

export const getMissingFieldsInPrompt = (inputText: string) => {
  const matches = [...inputText.matchAll(validationRegex)];

  return requiredFields.filter((field) => {
    return !matches.some((match) => match.groups && match?.groups?.[field]);
  });
};

export const getAccountName = (account: string) => {
  return env.VALID_ACCOUNTS[account] || "Unknown";
};
