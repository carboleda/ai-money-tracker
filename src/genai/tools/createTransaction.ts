import { TransactionCategory } from "@/interfaces/transaction";

const categories = Object.values(TransactionCategory).join(", ");

const declaration = {
  name: "createTransaction",
  description:
    "Creates a transaction that can be an income, expense or transfer",
  parameters: {
    type: "object",
    properties: {
      description: {
        type: "string",
        description:
          "Transaction description. A summary according to the purchased items, it should be at most 100 characters long",
      },
      amount: {
        type: "number",
        description:
          "Transaction amount in COP. Remove the thousand separators. This value is usually next to a label Venta, Total, etc. e.g. 123000, 15000, 1000, 20000.34",
      },
      type: {
        type: "string",
        description: "Transaction type: income, expense or transfer",
      },
      category: {
        type: "string",
        description: `Based on the description, it should be one of the following: ${categories}.`,
      },
      sourceAccount: {
        type: "string",
        description:
          "Source account if it applies. This is the account where the money comes from",
      },
      destinationAccount: {
        type: "string",
        description:
          "Destination account if it applies. This is the account where the money goes to",
      },
      createdAt: {
        type: "string",
        description:
          "Transaction date and time in ISO format yyyy-MM-dd'T'HH:mm",
      },
    },
    required: ["description", "amount", "type", "category", "sourceAccount"],
  },
};

export default declaration;
