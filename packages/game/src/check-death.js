import { Box } from "@cardcore/util";

export const CHECK_DEATH = "CHECK_DEATH";
export const checkDeath = () => async dispatch => {
  await dispatch({
    type: CHECK_DEATH
  });
};

export const checkDeathReducer = (state, action) => {
  if (action.type === CHECK_DEATH) {
    const traverse = boxId => Box.traverse(state, boxId);
    const newPlayers = {};
    Object.entries(state.game.players).forEach(([playerId, player]) => {
      newPlayers[playerId] = {
        ...player,
        field: player.field.filter(
          boxId => state.game.units[traverse(boxId)].health > 0
        ),
        graveyard: player.field.concat(
          player.field.filter(
            boxId => state.game.units[traverse(boxId)].health <= 0
          )
        )
      };
    });
    return {
      ...state,
      game: {
        ...state.game,
        players: newPlayers
      }
    };
  }

  return state;
};
