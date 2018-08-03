import {
  ALL_LOCATIONS,
  TYPE_CREATURE,
  TYPE_FACE,
  ALL_TYPES,
  PLAYER_SELF,
  PLAYER_ENEMY
} from "./constants";
import { rando } from "./random-util";

const noop = x => x;

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
export function target(state, target, func = noop) {
  let units = {};
  const owners = {};
  if (target.unitId) {
    units[target.unitId] = state.units[target.unitId];
    owners[target.unitId] = Object.keys(state.players).find(playerId => {
      return state.players[playerId].field.includes(target.unitId);
    });
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
    const owners = {};

    for (const [playerId, player] of Object.entries(state.players)) {
      if (!players.includes(playerId)) {
        continue;
      }
      if (types.includes(TYPE_FACE)) {
        units[player.unitId] = state.units[player.unitId];
        owners[player.unitId] = playerId;
      }
      if (!types.includes(TYPE_CREATURE)) {
        continue;
      }
      for (const location of locations) {
        for (const unitId of player[location]) {
          units[unitId] = state.units[unitId];
          owners[unitId] = playerId;
        }
      }
    }
  }

  if (target.random) {
    let newArray = Object.keys(units).sort();
    let newUnitIds = rando.shuffle(newArray);
    let newUnitObject = {};
    for (let i = 0; i < target.count; i++) {
      newUnitObject[newUnitIds[i]] = units[newUnitIds[i]];
    }
    units = newUnitObject;
  }

  for (const unitId of Object.keys(units)) {
    units[unitId] = func(units[unitId], { playerId: owners[unitId], unitId });
  }

  return units;
}

export function targetArray(state, action) {
  return Object.values(
    target(state, action, (unit, details) => {
      return { ...details, unit };
    })
  );
}
