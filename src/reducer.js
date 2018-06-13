import { gameReducer as game } from "./game";
import * as gameActions from "./game/actions";
import * as clientActions from "./client-actions";
import client from "./client-reducer";
import { combineReducers } from "redux";

const secret = function(state = {}, action) {
  return state;
};

export const combinedReducers = combineReducers({ game, client, secret });
export default function rootReducer(state, action) {
  state = combinedReducers(state, action);
  state = gameActions.seedRngReducer(state, action);

  if (action.type === clientActions.CLIENT_GENERATE_KEY) {
    return {
      ...state,
      secret: {
        ...state.secret,
        [action.keys.id]: action.keys
      }
    };
  }

  return state;
}
