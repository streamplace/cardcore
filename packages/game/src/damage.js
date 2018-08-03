import { target } from "@cardcore/util";

export const DAMAGE = "DAMAGE";

export const damageReducer = (state, action) => {
  if (action.type === DAMAGE) {
    return {
      ...state,
      game: {
        ...state.game,
        units: {
          ...state.game.units,
          ...target(state.game, action.target, unit => {
            return {
              ...unit,
              health: unit.health - action.value
            };
          })
        }
      }
    };
  }
  return state;
};
