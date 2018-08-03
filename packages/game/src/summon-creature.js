import { uid } from "@streamplace/card-util";

export const SUMMON_CREATURE = "SUMMON_CREATURE";

export const summonCreatureReducer = (state, action) => {
  if (action.type === SUMMON_CREATURE) {
    const playerUnitId = uid();
    const newUnit = {};
    const player = state.game.players[state.game.turn];
    newUnit[playerUnitId] = { ...action.unit };
    return {
      ...state,
      game: {
        ...state.game,
        players: {
          ...state.game.players,
          [state.game.turn]: {
            ...player,
            field: [...player.field, playerUnitId]
          }
        },
        units: {
          ...state.game.units,
          ...newUnit
        }
      }
    };
  }
  return state;
};
