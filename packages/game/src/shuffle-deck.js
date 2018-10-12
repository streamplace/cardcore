import { rotateArray, shuffle } from "@cardcore/util";
import { Box } from "@cardcore/util";

export const SHUFFLE_DECK = "SHUFFLE_DECK";
// export const shuffleDeck = action => (dispatch, getState) => {
//   dispatch(action);
// };

export const SHUFFLE_DECK_ENCRYPT = "SHUFFLE_DECK_ENCRYPT";
export const shuffleDeckEncrypt = ({ playerId }) => async (
  dispatch,
  getState
) => {
  const state = getState();
  let encryptedDeck = [];
  const boxes = {};
  for (const card of state.game.players[playerId].deck) {
    const { boxId, box } = Box.new(card, state.client.keys.id);
    encryptedDeck.push(boxId);
    boxes[boxId] = box;
  }
  return dispatch({
    type: SHUFFLE_DECK_ENCRYPT,
    deck: shuffle(encryptedDeck),
    boxes,
    playerId
  });
};

// for now this operates on the first card in someone's hand... maybe that's okay.
export const SHUFFLE_DECK_DECRYPT = "SHUFFLE_DECK_DECRYPT";
export const shuffleDeckDecrypt = ({ playerId, boxId }) => (
  dispatch,
  getState
) => {
  const state = getState();
  const key = Box.addKey(state, boxId, playerId);
  dispatch({
    type: SHUFFLE_DECK_DECRYPT,
    boxId,
    playerId,
    key
  });
};

export const shuffleDeckReducer = (state, action) => {
  if (action.type === SHUFFLE_DECK) {
    const encryptOrder = rotateArray(state.game.playerOrder, action.playerId);
    return {
      ...state,
      game: {
        ...state.game,
        nextActions: [
          ...encryptOrder.map(playerId => {
            return {
              playerId,
              action: {
                type: SHUFFLE_DECK_ENCRYPT,
                playerId: action.playerId
              }
            };
          }),
          ...state.game.nextActions
        ]
      }
    };
  }

  if (action.type === SHUFFLE_DECK_ENCRYPT) {
    return {
      ...state,
      game: {
        ...state.game,
        players: {
          ...state.game.players,
          [action.playerId]: {
            ...state.game.players[action.playerId],
            deck: action.deck
          }
        },
        boxes: action.deck.reduce(
          (boxes, boxId) => ({
            ...boxes,
            [boxId]: {
              contents: action.boxes[boxId].contents,
              keys: {
                [action.agent]: action.boxes[boxId].keys[action.agent]
              }
            }
          }),
          state.game.boxes
        )
      }
    };
  }

  if (action.type === SHUFFLE_DECK_DECRYPT) {
    const box = state.game.boxes[action.boxId];
    return {
      ...state,
      game: {
        ...state.game,
        boxes: {
          ...state.game.boxes,
          [action.boxId]: {
            ...box,
            keys: {
              ...box.keys,
              [action.playerId]: action.key
            }
          }
        }
      }
    };
  }

  return state;
};
