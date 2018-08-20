// import Ajv from "ajv";
// const ajv = new Ajv({ allErrors: true });
import ZSchema from "z-schema";
const validator = new ZSchema();

export default function queueReducer(state, action) {
  if (state.game.queue && state.game.queue.length > 0) {
    const schema = state.game.queue[0];
    // const validate = ajv.compile(schema);

    const valid = validator.validate(action, schema);
    if (!valid) {
      throw new Error(
        JSON.stringify({ action, errors: validator.getLastErrors() }, null, 2)
      );
    }
  }
  if (state.game.nextActions) {
    return {
      ...state,
      game: {
        ...state.game,
        queue: state.game.nextActions.map(action => ({
          type: "object",
          properties: {
            type: {
              type: "string",
              enum: [action.action.type]
            }
          }
        }))
      }
    };
  }

  return state;
}
