import {
  LOCATION_FIELD,
  LOCATION_DECK,
  LOCATION_HAND,
  LOCATION_GRAVEYARD,
  ALL_LOCATIONS,
  TYPE_CREATURE,
  TYPE_FACE,
  ALL_TYPES,
  PLAYER_SELF,
  PLAYER_ENEMY
} from "./constants";

/**
 * Returns an object of {unitId: unit}
 *
 * @export
 * @param {object} state
 * @param {object} target
 * @property {string} target.player
 * @property {string} target.location
 * @property {number} target.count
 * @property {boolean} target.random
 * @property {boolean} target.type
 */

const noop = x => x;

export default function target(state, target, func = noop) {
  const units = {};
  if (target.unitId) {
    units[target.unitId] = state.units[target.unitId];
  } else {
    let players;
    if (!target.player) {
      players = state.playerOrder;
    } else if (target.player === PLAYER_SELF) {
      players = [state.turn];
    } else if (target.player === PLAYER_ENEMY) {
      players = state.playerOrder.filter(p => p !== state.turn);
    } else {
      players = [target.player];
    }

    const locations = target.location ? [target.location] : ALL_LOCATIONS;
    const types = target.type ? [target.type] : ALL_TYPES;

    for (const [playerId, player] of Object.entries(state.players)) {
      if (!players.includes(playerId)) {
        continue;
      }
      if (types.includes(TYPE_FACE)) {
        units[player.unitId] = state.units[player.unitId];
      }
      if (!types.includes(TYPE_CREATURE)) {
        continue;
      }
      for (const location of locations) {
        for (const unitId of player[location]) {
          units[unitId] = state.units[unitId];
        }
      }
    }
  }

  for (const unitId of Object.keys(units)) {
    units[unitId] = func(units[unitId]);
  }

  return units;
}
