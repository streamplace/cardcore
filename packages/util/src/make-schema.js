export default function makeSchema(fields) {
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
  const schema = {
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

  // Shallow, first-pass validation to see if we have invalid enums
  for (const values of Object.values(schema.properties)) {
    if (values.enum === undefined) {
      continue;
    }
    if (values.enum.length === 0) {
      return null;
    }
  }
  return schema;
}
