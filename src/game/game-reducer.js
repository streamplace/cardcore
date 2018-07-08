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
