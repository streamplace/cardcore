import { Box, getLeftPlayer } from "@cardcore/util";
import { PLAY_CREATURE } from "./play-creature";
import { START_GAME } from "./start-game";

export const PLAY_CARD = "PLAY_CARD";
export const playCard = ({ boxId }) => ({
  type: "PLAY_CARD",
  boxId
});

export const REVEAL_CARD = "REVEAL_CARD";
export const revealCard = ({ boxId }) => (dispatch, getState) => {
  const state = getState();
  const me = state.client.keys;
  const box = state.game.boxes[boxId];
  const privateKey = Box.getPrivate(box, me);
  dispatch({
    type: "REVEAL_CARD",
    boxId,
    privateKey
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
    let nextActions = [
      ...state.game.nextActions,
      {
        playerId: action._sender,
        action: {
          type: PLAY_CREATURE,
          boxId: action.boxId
        }
      }
    ];
    if (!state.game.units[action.boxId]) {
      nextActions = [
        {
          playerId: getLeftPlayer(action._sender, state.game.playerOrder),
          action: {
            type: REVEAL_CARD,
            boxId: action.boxId
          }
        },
        ...nextActions
      ];
    }
    return {
      ...state,
      game: {
        ...state.game,
        nextActions: nextActions
      }
    };
  }

  if (action.type === REVEAL_CARD) {
    const box = state.game.boxes[action.boxId];
    const newBox = {
      ...box,
      privateKey: action.privateKey
    };
    const contents = Box.open(action.boxId, newBox, null);
    // if there's another box in here, pass to the player on our left
    let nextActions = state.game.nextActions;
    if (state.game.boxes[contents]) {
      nextActions = [
        {
          playerId: getLeftPlayer(action._sender, state.game.playerOrder),
          action: {
            type: REVEAL_CARD,
            boxId: contents
          }
        },
        ...nextActions
      ];
    } else if (!state.game.units[contents]) {
      throw new Error(`invalid card: ${contents}`);
    }
    return {
      ...state,
      game: {
        ...state.game,
        boxes: {
          ...state.game.boxes,
          [action.boxId]: newBox
        },
        nextActions: nextActions
      }
    };
  }
  return state;
};
