import { gameReducer as game } from "./game";
import * as gameActions from "./game/actions";
import * as clientActions from "./client-actions";
import client from "./client-reducer";
import { combineReducers } from "redux";

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

export const combinedReducers = combineReducers({ game, client, secret });
export default function rootReducer(state, action) {
  state = combinedReducers(state, action);
  for (const reducer of gameReducers) {
    state = reducer(state, action);
    if (!state) {
      throw new Error(`${reducer.name} returned undefined`);
    }
  }

  return state;
}
