import { CHECK_DEATH } from "./check-death";
import { START_GAME } from "./start-game";

export const ATTACK = "ATTACK";
export const attack = (attackingUnitId, defendingUnitId) => {
  return {
    type: ATTACK,
    attackingUnitId,
    defendingUnitId
  };
};

export const attackReducer = (state, action) => {
  if (action.type === START_GAME) {
    return {
      ...state,
      game: {
        ...state.game,
        allowedActions: {
          ...state.game.allowedActions,
          [ATTACK]: true
        }
      }
    };
  }

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
        },
        nextActions: [
          {
            playerId: action._sender,
            action: {
              type: CHECK_DEATH
            }
          }
        ]
      }
    };
  }
  return state;
};
