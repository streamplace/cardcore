import * as gameActions from "@cardcore/game";
import * as clientActions from "@cardcore/client";
import { rando } from "@cardcore/util";

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

export default function rootReducer(state = {}, action) {
  let startRandoSeed = state.game && state.game.randoSeed;
  if (state.game && state.game.randoSeed) {
    rando.setSeed(startRandoSeed);
  }
  const reducers = { client: clientActions.clientReducer, secret };
  // temporary hacky game init logic
  if (action.type === clientActions.CLIENT_LOAD_STATE) {
    return {
      ...state,
      game: action.gameState
    };
  }
  // special logic to clean out the queue if we're executing a queued action
  if (
    state &&
    state.game &&
    state.game.nextActions &&
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

  if (state.game && rando.seed && state.game.randoSeed !== rando.seed) {
    state = {
      ...state,
      game: {
        ...state.game,
        randoSeed: rando.seed
      }
    };
  }
  rando.clearSeed();
  return state;
}
