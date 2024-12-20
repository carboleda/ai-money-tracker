const declaration = {
  name: "invalidTransaction",
  description: "Allows to report invalid transactions",
  parameters: {
    type: "object",
    properties: {
      error: {
        type: "string",
        description:
          "A maeaningful error message that describes the problem with the transaction",
      },
    },
    required: ["error"],
  },
};

export default declaration;
