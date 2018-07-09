export * from "./attack";
export * from "./bounce";
export * from "./buff";
export * from "./check-death";
export * from "./damage";
export * from "./desync";
export * from "./draw-card";
export * from "./play-creature";
export * from "./seed-rng";
export * from "./shuffle-deck";
export * from "./start-game";
export * from "./summon-creature";
export * from "./turns";

export const gameReducer = (state, action) => {
  // initialization
  if (action.type === "@@INIT") {
    return {
      ...state,
      game: {
        nextActions: [],
        playerOrder: [],
        params: {
          startDraw: 3
        },
        started: false,
        players: {},
        units: {},
        randoSeeds: {}
      }
    };
  }

  return state;
};
