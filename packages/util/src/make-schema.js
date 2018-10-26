export default function actionSchema(fields) {
  if (!fields.type) {
    throw new Error("type required");
  }
  fields = { ...fields };
  // Allow for shorthand for the super-common single string type
  for (const field of Object.keys(fields)) {
    if (typeof fields[field] === "string") {
      fields[field] = {
        enum: [fields[field]]
      };
    }
  }
  return {
    type: "object",
    additionalProperties: false,
    required: Object.keys(fields).sort(),
    properties: {
      type: {
        enum: [fields.type.enum[0]]
      },
      prev: {
        type: "string"
      },
      next: {
        type: "string"
      },
      signature: {
        type: "string"
      },
      ...fields
    }
  };
}
