import {
  ALL_LOCATIONS,
  TYPE_CREATURE,
  TYPE_FACE,
  ALL_TYPES,
  PLAYER_SELF,
  PLAYER_ENEMY
} from "./constants";
import { rando } from "./random-util";
import { Box } from "@cardcore/util";

const noop = x => x;

/**
 * Returns an object of {unitId: unit}
 *
 * @export
 * @param {object} game
 * @param {object} target
 * @property {string} target.player
 * @property {string} target.location
 * @property {number} target.count
 * @property {boolean} target.random
 * @property {boolean} target.type
 */
export function target(state, target, func = noop) {
  const hasFullState = !!state.game;
  let game = hasFullState ? state.game : state;
  let units = {};
  const owners = {};
  if (target.unitId) {
    units[target.unitId] = game.units[target.unitId];
    owners[target.unitId] = Object.keys(game.players).find(playerId => {
      return game.players[playerId].field.includes(target.unitId);
    });
  } else {
    let players;
    if (!target.player) {
      players = game.playerOrder;
    } else if (target.player === PLAYER_SELF) {
      players = [game.turn];
    } else if (target.player === PLAYER_ENEMY) {
      players = game.playerOrder.filter(p => p !== game.turn);
    } else {
      players = [target.player];
    }

    const locations = target.location ? [target.location] : ALL_LOCATIONS;
    const types = target.type ? [target.type] : ALL_TYPES;
    const owners = {};

    for (const [playerId, player] of Object.entries(game.players)) {
      if (!players.includes(playerId)) {
        continue;
      }
      if (types.includes(TYPE_FACE)) {
        units[player.unitId] = game.units[player.unitId];
        owners[player.unitId] = playerId;
      }
      if (!types.includes(TYPE_CREATURE)) {
        continue;
      }
      for (const location of locations) {
        for (const boxId of player[location]) {
          if (!hasFullState) {
            throw new Error("Deprecated call to target(), need full state");
          }
          const unitId = Box.traverse(state, boxId);
          if (!unitId) {
            console.error(
              `Tried to target something I can't decrypt, ${JSON.stringify({
                location,
                boxId,
                playerId
              })}`
            );
            continue;
          }
          units[unitId] = game.units[unitId];
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

export function targetArray(game, action) {
  return Object.values(
    target(game, action, (unit, details) => {
      return { ...details, unit };
    })
  );
}
