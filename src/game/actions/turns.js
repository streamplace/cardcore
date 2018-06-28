import { DRAW_CARD } from "./draw-card";

export const START_TURN = "START_TURN";
export const startTurn = () => async (dispatch, getState) => {
  const playerId = getState().game.turn;
  await dispatch({ type: START_TURN });
};

export const END_TURN = "END_TURN";
export const endTurn = () => async (dispatch, getState) => {
  await dispatch({
    type: END_TURN
  });
};

export function turnReducer(state, action) {
  if (action.type === START_TURN) {
    const player = state.game.players[state.game.turn];
    let newMana = player.mana + 1;

    if (newMana > 10) {
      newMana = 10;
    }
    const newUnits = {};
    player.field.forEach(unitId => {
      newUnits[unitId] = {
        ...state.game.units[unitId],
        canAttack: true
      };
    });
    return {
      ...state,
      game: {
        ...state.game,
        units: {
          ...state.game.units,
          ...newUnits
        },
        players: {
          ...state.game.players,
          [state.game.turn]: {
            ...player,
            mana: newMana,
            availableMana: newMana
          }
        },
        nextActions: [
          {
            playerId: state.game.turn,
            action: { type: DRAW_CARD, target: { player: state.game.turn } }
          },
          ...state.game.nextActions
        ]
      }
    };
  }

  if (action.type === END_TURN) {
    const playerIdx =
      (state.game.playerOrder.indexOf(state.game.turn) + 1) %
      state.game.playerOrder.length;
    const playerId = state.game.playerOrder[playerIdx];
    return {
      ...state,
      game: {
        ...state.game,
        turn: playerId,
        nextActions: [
          {
            playerId,
            action: {
              type: START_TURN
            }
          }
        ]
      }
    };
  }

  return state;
}
