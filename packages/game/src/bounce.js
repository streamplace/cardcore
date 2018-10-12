import { targetArray } from "@cardcore/util";

export const BOUNCE = "BOUNCE";
export const bounce = ({ target }) => {
  return { type: BOUNCE, target };
};

export const BOUNCE_ENCRYPT = "BOUNCE_ENCRYPT";
export const bounceEncrypt = ({ unitId }) => async (dispatch, getState) => {
  return dispatch({
    type: "BOUNCE_ENCRYPT",
    unitId
  });
};

export const bounceReducer = (state, action) => {
  if (action.type === BOUNCE) {
    const targets = targetArray(state.game, action.target);
    return {
      ...state,
      game: {
        ...state.game,
        nextActions: [
          ...targets.map(target => {
            return {
              playerId: target.playerId,
              action: {
                type: BOUNCE_ENCRYPT,
                unitId: target.unitId
              }
            };
          }),
          ...state.game.nextActions
        ]
      }
    };
  }
  if (action.type === BOUNCE_ENCRYPT) {
    const player = state.game.players[action.agent];
    return {
      ...state,
      game: {
        ...state.game,
        players: {
          ...state.game.players,
          [action.agent]: {
            ...player,
            hand: [...player.hand, action.unitId],
            field: player.field.filter(unitId => unitId !== action.unitId)
          }
        }
      }
    };
  }
  return state;
};
