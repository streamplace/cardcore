import { target } from "@streamplace/card-util";

export const CHANGE_ATTACK = "CHANGE_ATTACK";
export const CHANGE_HEALTH = "CHANGE_HEALTH";

export const buffReducer = (state, action) => {
  if (action.type === CHANGE_ATTACK) {
    return {
      ...state,
      game: {
        ...state.game,
        units: {
          ...state.game.units,
          ...target(state.game, action.target, unit => {
            return {
              ...unit,
              attack: action.value
            };
          })
        }
      }
    };
  }

  if (action.type === CHANGE_HEALTH) {
    return {
      ...state,
      game: {
        ...state.game,
        units: {
          ...state.game.units,
          ...target(state.game, action.target, unit => {
            return {
              ...unit,
              health: action.value
            };
          })
        }
      }
    };
  }

  return state;
};
