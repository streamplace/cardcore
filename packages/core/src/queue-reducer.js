// import Ajv from "ajv";
// const ajv = new Ajv({ allErrors: true });
import ZSchema from "z-schema";
const validator = new ZSchema();

export default function queueReducer(state, action) {
  // hack
  action = {
    ...action,
  };
  delete action.__REMOTE_ACTION;
  const schema = state.game.queue[0];
  if (!schema) {
    throw new Error(
      JSON.stringify({ errorType: "EMPTY_QUEUE", action }, null, 2),
    );
  }
  // const validate = ajv.compile(schema);

  // z-schema crashes if any fields are undefined, find that first
  const queue = [[schema, ""]];
  while (queue.length > 0) {
    const [node, path] = queue.pop();
    if (typeof node === "undefined") {
      throw new Error(
        JSON.stringify(
          {
            errorType: "INVALID_SCHEMA",
            message: `json-schemas may not contain undefined values — found undefined at ${path}`,
            action,
            schema,
          },
          null,
          2,
        ),
      );
    }
    if (typeof node === "object" && node !== null) {
      Object.entries(node).forEach(([key, value]) => {
        queue.push([value, `${path}.${key}`]);
      });
    }
  }

  // Catch this one first - it's not necessarily what the validator picks up on first
  if (
    schema.properties &&
    schema.properties.type &&
    schema.properties.type.enum &&
    schema.properties.type.enum.length === 1
  ) {
    const expectedType = schema.properties.type.enum[0];
    if (expectedType !== action.type) {
      throw new Error(`Expected ${expectedType}, got ${action.type}`);
    }
  }

  const valid = validator.validate(action, schema);
  if (!valid) {
    throw new Error(
      JSON.stringify(
        { errors: validator.getLastErrors(), action, schema },
        null,
        2,
      ),
    );
  }

  // cool, this action validated, we can remove it now
  return {
    ...state,
    game: {
      ...state.game,
      queue: state.game.queue.slice(1),
    },
  };
}
