import { SHUFFLE_DECK_DECRYPT } from "./shuffle-deck";
export const DRAW_CARD = "DRAW_CARD";

export function drawCardReducer(state, action) {
  if (action.type === DRAW_CARD) {
    let players = state.game.playerOrder;
    if (action.target.player === "self") {
      players = [state.game.turn];
    } else if (action.target.player === "enemy") {
      players = state.game.playerOrder.filter(x => x !== state.game.turn);
    } else if (action.target.player) {
      players = [action.target.player];
    } else if (action.target.playerId) {
      players = [action.target.playerId];
    }
    for (const playerId of players) {
      const player = state.game.players[playerId];
      const boxId = player.deck[0];
      if (!boxId) {
        // fatigue
        return {
          ...state,
          game: {
            ...state.game,
            units: {
              ...state.game.units,
              [player.unitId]: {
                ...state.game.units[player.unitId],
                health: state.game.units[player.unitId].health - player.fatigue
              }
            },
            players: {
              ...state.game.players,
              [playerId]: {
                ...player,
                fatigue: player.fatigue + 1
              }
            }
          }
        };
      }
      return {
        ...state,
        game: {
          ...state.game,
          players: {
            ...state.game.players,
            [playerId]: {
              ...player,
              hand: [boxId, ...player.hand],
              deck: player.deck.slice(1)
            }
          },
          nextActions: [
            {
              playerId: Object.keys(state.game.boxes[boxId].keys).sort()[0],
              action: {
                type: SHUFFLE_DECK_DECRYPT,
                playerId: playerId,
                boxId: boxId
              }
            },
            ...state.game.nextActions
          ]
        }
      };
    }
    return state;
  }

  return state;
}
