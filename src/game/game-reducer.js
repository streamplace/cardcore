import * as actions from "./actions";
import target from "./target-helper";
import ssbKeys from "ssb-keys";
import { uid } from "../util";

const INITIAL_STATE = {
  nextActions: [],
  playerOrder: [],
  params: {
    startDraw: 3
  },
  started: false,
  players: {},
  units: {},
  randoSeeds: {}
};

export default function reducer(state = INITIAL_STATE, action) {
  // special logic to clean out the queue if we're executing a queued action
  if (
    state.nextActions[0] &&
    (action._sender === state.nextActions[0].playerId ||
      action._sender !== state.nextActions[0].notPlayerId) && // omfg hack
    action.type === state.nextActions[0].action.type
  ) {
    state = {
      ...state,
      nextActions: state.nextActions.slice(1)
    };
  }

  if (action.type === actions.PLAY_CREATURE) {
    const player = state.players[action._sender];
    const card = player.hand.filter(card => card.id === action.id)[0];
    const unitId = ssbKeys.unbox(card.box, { private: action.privateKey });
    const unit = state.units[unitId];
    return {
      ...state,
      players: {
        ...state.players,
        [action._sender]: {
          ...player,
          availableMana: player.availableMana - unit.cost,
          hand: player.hand.filter(c => c !== card),
          field: [unitId, ...player.field]
        }
      },
      units: { ...state.units, [unitId]: { ...unit, canAttack: false } },
      nextActions: [
        {
          playerId: action._sender,
          action: {
            type: actions.SEED_RNG
          }
        },
        ...unit.onSummon
          .filter((onSummon, i) => {
            if (Object.keys(target(state, onSummon.target)).length === 0) {
              return false;
            }
            return true;
          })
          .map((onSummon, i) => {
            return {
              playerId: action._sender,
              action: {
                ...onSummon,
                target: {
                  ...onSummon.target,
                  unitId: onSummon.target.random ? undefined : action.targets[i]
                },
                unitId: unitId
              }
            };
          }),
        { playerId: action._sender, action: { type: actions.CHECK_DEATH } },
        ...state.nextActions
      ]
    };
  }

  if (action.type === actions.ATTACK) {
    const { attackingUnitId, defendingUnitId } = action;
    const attackingUnit = state.units[attackingUnitId];
    const defendingUnit = state.units[defendingUnitId];
    return {
      ...state,
      units: {
        ...state.units,
        [attackingUnitId]: {
          ...attackingUnit,
          health: attackingUnit.health - defendingUnit.attack,
          canAttack: false
        },
        [defendingUnitId]: {
          ...defendingUnit,
          health: defendingUnit.health - attackingUnit.attack
        }
      }
    };
  }

  if (action.type === actions.DAMAGE) {
    return {
      ...state,
      units: {
        ...state.units,
        ...target(state, action.target, unit => {
          return {
            ...unit,
            health: unit.health - action.value
          };
        })
      }
    };
  }

  if (action.type === actions.CHECK_DEATH) {
    const newPlayers = {};
    Object.entries(state.players).forEach(([playerId, player]) => {
      newPlayers[playerId] = {
        ...player,
        field: player.field.filter(unitId => state.units[unitId].health > 0),
        graveyard: player.field.concat(
          player.field.filter(unitId => state.units[unitId].health <= 0)
        )
      };
    });
    return {
      ...state,
      players: newPlayers
    };
  }

  if (action.type === actions.CHANGE_ATTACK) {
    return {
      ...state,
      units: {
        ...state.units,
        ...target(state, action.target, unit => {
          return {
            ...unit,
            attack: action.value
          };
        })
      }
    };
  }

  if (action.type === actions.CHANGE_HEALTH) {
    return {
      ...state,
      units: {
        ...state.units,
        ...target(state, action.target, unit => {
          return {
            ...unit,
            health: action.value
          };
        })
      }
    };
  }

  if (action.type === actions.SUMMON_CREATURE) {
    const playerUnitId = uid();
    const newUnit = {};
    const player = state.players[state.turn];
    newUnit[playerUnitId] = { ...action.unit };
    return {
      ...state,
      players: {
        ...state.players,
        [state.turn]: {
          ...player,
          field: [...player.field, playerUnitId]
        }
      },
      units: {
        ...state.units,
        ...newUnit
      }
    };
  }

  if (action.type === actions.BUFF) {
    return {
      ...state,
      units: {
        ...state.units,
        ...target(state, action.target, unit => {
          return {
            ...unit,
            attack: unit.attack + action.attack,
            health: unit.health + action.health
          };
        })
      }
    };
  }

  return state;
}
