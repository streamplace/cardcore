import { checkDeath } from "./check-death";

export const ATTACK = "ATTACK";
export const attack = (attackingUnitId, defendingUnitId) => async dispatch => {
  await dispatch({
    type: ATTACK,
    attackingUnitId,
    defendingUnitId
  });
  dispatch(checkDeath());
};

export const attackReducer = (state, action) => {
  if (action.type === ATTACK) {
    const { attackingUnitId, defendingUnitId } = action;
    const attackingUnit = state.game.units[attackingUnitId];
    const defendingUnit = state.game.units[defendingUnitId];
    return {
      ...state,
      game: {
        ...state.game,
        units: {
          ...state.game.units,
          [attackingUnitId]: {
            ...attackingUnit,
            health: attackingUnit.health - defendingUnit.attack,
            canAttack: false
          },
          [defendingUnitId]: {
            ...defendingUnit,
            health: defendingUnit.health - attackingUnit.attack
          }
        }
      }
    };
  }
  return state;
};
