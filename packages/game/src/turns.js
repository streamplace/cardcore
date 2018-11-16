import { Box, makeSchema } from "@cardcore/util";
import { DRAW_CARD } from "./draw-card";
import { START_GAME } from "./start-game";
import { STANDARD_ACTION } from "./standard-action";

export const START_TURN = "START_TURN";
export const END_TURN = "END_TURN";

export function turnReducer(state, action) {
  if (action.type === START_GAME) {
    return {
      ...state,
      game: {
        ...state.game,
        allowedActions: {
          ...state.game.allowedActions,
          [END_TURN]: true
        }
      }
    };
  }

  if (action.type === START_TURN) {
    const player = state.game.players[state.game.turn];
    let newMana = player.mana + 1;

    if (newMana > 10) {
      newMana = 10;
    }
    const newUnits = {};
    player.field.forEach(boxId => {
      const unitId = Box.traverse(state, boxId);
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
          {
            playerId: state.game.turn,
            action: { type: STANDARD_ACTION }
          },
          ...state.game.nextActions
        ],
        queue: [
          makeSchema({
            type: DRAW_CARD,
            agent: state.game.turn,
            target: {
              type: "object",
              additionalProperties: false,
              required: ["player"],
              properties: {
                player: {
                  enum: [state.game.turn]
                }
              }
            }
          }),
          makeSchema({
            type: STANDARD_ACTION,
            agent: state.game.turn
          }),
          ...state.game.queue
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
        ],
        queue: [
          makeSchema({
            type: START_TURN,
            agent: playerId
          })
        ]
      }
    };
  }

  return state;
}
