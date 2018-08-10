import { Box } from "@cardcore/util";
import { PLAY_CREATURE } from "./play-creature";
import { START_GAME } from "./start-game";

export const PLAY_CARD = "PLAY_CARD";
export const playCard = ({ boxId }) => (dispatch, getState) => {
  const state = getState();
  const me = state.client.keys;
  const box = state.game.boxes[boxId];
  const keys = state.game.playerOrder.filter(id => id !== me.id).reduce(
    (keys, playerId) => ({
      ...keys,
      [playerId]: Box.addKey(box, me, playerId)
    }),
    {}
  );
  dispatch({
    type: "PLAY_CARD",
    boxId,
    keys
  });
};

// TODO: are you adding not-creatures? go here!
export const playCardReducer = (state, action) => {
  if (action.type === START_GAME) {
    return {
      ...state,
      game: {
        ...state.game,
        allowedActions: {
          ...state.game.allowedActions,
          [PLAY_CARD]: true
        }
      }
    };
  }

  if (action.type === PLAY_CARD) {
    const box = state.game.boxes[action.boxId];
    const playerIds = state.game.playerOrder.filter(
      id => id !== action._sender
    );
    return {
      ...state,
      game: {
        ...state.game,
        boxes: {
          ...state.game.boxes,
          [action.boxId]: {
            ...box,
            keys: playerIds.reduce(
              (keys, playerId) => ({
                ...keys,
                [playerId]: action.keys[playerId]
              }),
              box.keys
            )
          }
        },
        nextActions: [
          ...state.game.nextActions,
          {
            playerId: action._sender,
            action: {
              type: PLAY_CREATURE,
              boxId: action.boxId
            }
          }
        ]
      }
    };
  }
  return state;
};
