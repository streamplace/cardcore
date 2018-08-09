import { rotateArray, shuffle } from "@cardcore/util";
import { clientGenerateKey, clientBox } from "@cardcore/client";
import ssbKeys from "@streamplace/ssb-keys";

export const SHUFFLE_DECK = "SHUFFLE_DECK";
// export const shuffleDeck = action => (dispatch, getState) => {
//   dispatch(action);
// };

export const SHUFFLE_DECK_ENCRYPT = "SHUFFLE_DECK_ENCRYPT";
export const shuffleDeckEncrypt = ({ playerId }) => async (
  dispatch,
  getState
) => {
  let encryptedDeck = [];
  for (const card of getState().game.players[playerId].deck) {
    const { keys } = await dispatch(clientGenerateKey());
    encryptedDeck.push(await dispatch(clientBox(card, keys)));
  }
  return dispatch({
    type: SHUFFLE_DECK_ENCRYPT,
    deck: shuffle(encryptedDeck),
    playerId
  });
};

// for now this operates on the first card in someone's hand... maybe that's okay.
export const SHUFFLE_DECK_DECRYPT = "SHUFFLE_DECK_DECRYPT";
export const shuffleDeckDecrypt = ({ playerId }) => (dispatch, getState) => {
  const state = getState();
  const encryptedCard = state.game.players[playerId].hand[0];
  const keys = state.secret[encryptedCard.id];
  dispatch({
    type: SHUFFLE_DECK_DECRYPT,
    privateKey: keys.private,
    playerId
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
        }
      }
    };
  }

  if (action.type === SHUFFLE_DECK_DECRYPT) {
    return {
      ...state,
      game: {
        ...state.game,
        players: {
          ...state.game.players,
          [action.playerId]: {
            ...state.game.players[action.playerId],
            hand: [
              ssbKeys.unbox(state.game.players[action.playerId].hand[0].box, {
                private: action.privateKey
              }),
              ...state.game.players[action.playerId].hand.slice(1)
            ]
          }
        }
      }
    };
  }

  return state;
};
