export * from "./attack";
export * from "./bounce";
export * from "./box";
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

export const gameReducer = (state, action) => {
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
