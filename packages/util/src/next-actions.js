/**
 * Return all the potential next actions given a schema
 * @param {object} schema
 */
export function nextActions(schema) {
  // umm.... ignore for now?
  if (schema.type === "string") {
    return [undefined];
  }

  // easy case... if we have an enum
  if (schema.enum) {
    return schema.enum;
  }

  if (schema.anyOf) {
    return schema.anyOf
      .map(nextActions)
      .reduce((all, arr) => [...all, ...arr], []);
  }

  if (schema.type === "object") {
    for (const [key, property] of Object.entries(schema)) {
    }
  }
}
