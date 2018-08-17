export * from "./attack";
export * from "./bounce";
export * from "./buff";
export * from "./check-death";
export * from "./damage";
export * from "./desync";
export * from "./draw-card";
export * from "./play-card";
export * from "./play-creature";
export * from "./seed-rng";
export * from "./shuffle-deck";
export * from "./start-game";
export * from "./summon-creature";
export * from "./turns";

import { CREATE_GAME, JOIN_GAME } from "./start-game";

export const gameReducer = (state, action) => {
  // initialization
  // On this one, clear out both the nextActions queue and the players list... this is the first
  // person joining. Everyone else joins with JOIN_GAME
  if (action.type === CREATE_GAME) {
    return {
      ...state,
      game: {
        ...state.game,
        startTime: action.startTime,
        nextActions: [
          {
            action: { type: JOIN_GAME },
            // lol lol lol hack hack hack
            notPlayerId: action._sender
          }
        ],
        allowedActions: {},
        playerOrder: [],
        params: {
          startDraw: 3
        },
        started: false,
        players: {
          [action._sender]: {}
        },
        units: {},
        randoSeeds: {},
        prev: null,
        boxes: {}
      }
    };
  }

  if (action.prev) {
    return {
      ...state,
      game: {
        ...state.game,
        prev: action.prev
      }
    };
  }

  return state;
};
