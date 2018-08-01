import * as gameActions from "@streamplace/card-game";
import * as clientActions from "@streamplace/card-client";
import { clientReducer as client } from "@streamplace/card-client";

// automatically find any reducer functions in the actions file and call them
const gameReducers = Object.keys(gameActions)
  .filter(key => key.endsWith("Reducer"))
  .map(key => gameActions[key]);

const secret = function(state = {}, action) {
  if (action.type === clientActions.CLIENT_GENERATE_KEY) {
    return {
      ...state,
      [action.keys.id]: action.keys
    };
  }

  if (action.type === clientActions.CLIENT_BOX) {
    return {
      ...state,
      [action.id]: {
        ...state[action.id],
        contents: action.contents
      }
    };
  }

  return state;
};

const reducers = { client, secret };
export default function rootReducer(state = {}, action) {
  // special logic to clean out the queue if we're executing a queued action
  if (
    state &&
    state.game &&
    state.game.nextActions[0] &&
    (action._sender === state.game.nextActions[0].playerId ||
      action._sender !== state.game.nextActions[0].notPlayerId) && // omfg hack
    action.type === state.game.nextActions[0].action.type
  ) {
    state = {
      ...state,
      game: {
        ...state.game,
        nextActions: state.game.nextActions.slice(1)
      }
    };
  }

  for (const [name, reducer] of Object.entries(reducers)) {
    const newState = reducer(state[name], action);
    if (state[name] !== newState) {
      state = {
        ...state,
        [name]: newState
      };
    }
  }
  for (const reducer of gameReducers) {
    state = reducer(state, action);
    if (!state) {
      throw new Error(`${reducer.name} returned undefined`);
    }
  }

  return state;
}
