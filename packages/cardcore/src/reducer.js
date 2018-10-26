import queueReducer from "./queue-reducer";
import { rando, makeSchema } from "@cardcore/util";

const DEFAULT_STATE = {
  game: {
    queue: [
      makeSchema({
        type: {
          enum: ["CREATE_GAME"]
        },
        startTime: {
          type: "number"
        },
        agent: {
          type: "string"
        },
        // this won't be null once we take over the world
        prev: {
          enum: [null]
        }
      })
    ]
  }
};

const getReducers = mod =>
  Object.keys(mod)
    .filter(key => key.endsWith("Reducer"))
    .map(key => mod[key]);

export function createReducer(gameModules, clientModules = {}) {
  const gameReducers = getReducers(gameModules);
  const clientReducers = getReducers(clientModules);
  return function rootReducer(state = DEFAULT_STATE, action) {
    let startRandoSeed = state.game && state.game.randoSeed;
    if (state.game && state.game.randoSeed) {
      rando.setSeed(startRandoSeed);
    }
    // temporary hacky game init logic
    if (action.type === clientModules.CLIENT_LOAD_STATE_START) {
      state = {
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
      (action.agent === state.game.nextActions[0].playerId ||
        action.agent !== state.game.nextActions[0].notPlayerId) && // omfg hack
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

    if (gameModules[action.type]) {
      state = queueReducer(state, action);
    }

    for (const reducer of [...gameReducers, ...clientReducers]) {
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
  };
}
