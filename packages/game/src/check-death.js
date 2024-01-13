import { Box, makeSchema } from "@cardcore/util";
import { DEFEAT } from "./defeat";

export const CHECK_DEATH = "CHECK_DEATH";
export const checkDeath = () => async (dispatch) => {
  await dispatch({
    type: CHECK_DEATH,
  });
};

export const checkDeathReducer = (state, action) => {
  if (action.type === CHECK_DEATH) {
    const traverse = (boxId) => Box.traverse(state, boxId);
    const newPlayers = {};
    const defeats = [];
    Object.entries(state.game.players).forEach(([playerId, player]) => {
      if (!player.field) {
        newPlayers[playerId] = player;
        return;
      }
      newPlayers[playerId] = {
        ...player,
        field: player.field.filter(
          (boxId) => state.game.units[traverse(boxId)].health > 0,
        ),
        graveyard: player.field.concat(
          player.field.filter(
            (boxId) => state.game.units[traverse(boxId)].health <= 0,
          ),
        ),
      };
      const playerUnit = state.game.units[player.unitId];
      if (playerUnit.health <= 0) {
        defeats.push(playerId);
      }
    });

    if (defeats.length > 0) {
      defeats.sort();
      return {
        ...state,
        game: {
          ...state.game,
          players: newPlayers,
          nextActions: defeats.map((pid) => ({
            playerId: pid,
            action: {
              type: DEFEAT,
              agent: pid,
            },
          })),
          queue: defeats
            .map((agent) => ({
              type: DEFEAT,
              agent,
            }))
            .map(makeSchema),
        },
      };
    }

    return {
      ...state,
      game: {
        ...state.game,
        players: newPlayers,
      },
    };
  }

  return state;
};
