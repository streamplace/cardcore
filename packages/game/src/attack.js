import { CHECK_DEATH } from "./check-death";
import { START_GAME } from "./start-game";
import { STANDARD_ACTION } from "./standard-action";
import { makeSchema } from "@cardcore/util";

export const ATTACK = "ATTACK";
export const attack = (attackingUnitId, defendingUnitId) => {
  return {
    type: ATTACK,
    attackingUnitId,
    defendingUnitId,
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
          [ATTACK]: true,
        },
      },
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
            canAttack: false,
          },
          [defendingUnitId]: {
            ...defendingUnit,
            health: defendingUnit.health - attackingUnit.attack,
          },
        },
        nextActions: [
          {
            playerId: action.agent,
            action: {
              type: CHECK_DEATH,
            },
          },
          {
            playerId: action.agent,
            action: {
              type: STANDARD_ACTION,
            },
          },
          ...state.game.nextActions,
        ],
        queue: [
          makeSchema({
            type: CHECK_DEATH,
            agent: action.agent,
          }),
          makeSchema({
            type: STANDARD_ACTION,
            agent: action.agent,
          }),
          ...state.game.queue,
        ],
      },
    };
  }
  return state;
};
