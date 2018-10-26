// import Ajv from "ajv";
// const ajv = new Ajv({ allErrors: true });
import ZSchema from "z-schema";
const validator = new ZSchema();

const handlePlayerId = action => {
  if (action.playerId) {
    return {
      enum: [action.playerId]
    };
  } else if (action.notPlayerId) {
    return {
      not: {
        enum: [action.notPlayerId]
      }
    };
  }
};

export default function queueReducer(state, action) {
  // hack
  action = {
    ...action
  };
  delete action.__REMOTE_ACTION;
  const schema = state.game.queue[0];
  if (!schema) {
    throw new Error("empty queue! game over!");
  }
  // const validate = ajv.compile(schema);

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
        2
      )
    );
  }

  // cool, this action validated, we can remove it now

  return {
    ...state,
    game: {
      ...state.game,
      queue: state.game.queue.slice(1)
    }
  };

  if (state.game.nextActions) {
    // return {
    //   ...state,
    //   game: {
    //     ...state.game,
    //     queue: state.game.nextActions.map(action => ({
    //       type: "object",
    //       additionalProperties: false,
    //       properties: {
    //         type: {
    //           enum: [action.action.type]
    //         },
    //         agent: {
    //           type: "string",
    //           ...handlePlayerId(action)
    //         },
    //         prev: {
    //           type: "string"
    //         },
    //         next: {
    //           type: "string"
    //         },
    //         signature: {
    //           type: "string"
    //         }
    //       }
    //     }))
    //   }
    // };
  }

  return state;
}
