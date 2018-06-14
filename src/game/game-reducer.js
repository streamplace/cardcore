import * as actions from "./actions";
import target from "./target-helper";
import { getStandardDeck, getStandardEmoji } from "../standard";
import RandomUtil from "../random-util";
import { range } from "../util";
import ssbKeys from "ssb-keys";

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

const INITIAL_PLAYER = {
  mana: 0,
  availableMana: 0,
  hand: [],
  field: [],
  graveyard: [],
  fatigue: 1
};

/**
 * id-generation function that assumes that all users will execute it in the _exact_ same order.
 * this is.... hopefully reasonable.
 */
let cur = 0;
const uid = () => {
  let res = `id-${cur}`;
  cur += 1;
  return res;
};

// same deal but for random numbers
const rando = new RandomUtil();

export default function reducer(state = INITIAL_STATE, action) {
  // special logic to clean out the queue if we're executing a queued action
  if (action._fromQueue) {
    state = {
      ...state,
      nextActions: state.nextActions.slice(1)
    };
  }

  if (action.type === actions.JOIN_GAME_START) {
    // On this one, clear out both the nextActions queue and the players list... this is the first
    // person joining. Everyone else joins with JOIN_GAME_ACCEPT
    return {
      ...state,
      players: {
        [action._sender]: {}
      },
      nextActions: [
        {
          action: { type: actions.JOIN_GAME_ACCEPT },
          // lol lol lol hack hack hack
          notPlayerId: action._sender
        }
      ]
    };
  }

  if (action.type === actions.JOIN_GAME_ACCEPT) {
    let lexicalPlayers = [...Object.keys(state.players), action._sender].sort();
    return {
      ...state,
      players: {
        ...state.players,
        [action._sender]: {}
      },
      nextActions: [
        {
          playerId: lexicalPlayers[0],
          action: {
            type: actions.SEED_RNG
          }
        },
        {
          playerId: lexicalPlayers[0],
          action: {
            type: actions.ORDER_PLAYERS
          }
        }
      ]
    };
  }

  if (action.type === actions.ORDER_PLAYERS) {
    rando.setSeed(state.randoSeed);
    const playerOrder = rando.shuffle(Object.keys(state.players).sort());
    return {
      ...state,
      playerOrder: playerOrder,
      turn: playerOrder[0],
      nextActions: [
        ...playerOrder.map(playerId => ({
          playerId,
          action: { type: actions.START_GAME }
        })),
        {
          playerId: playerOrder[0],
          action: {
            type: actions.START_TURN
          }
        },
        ...state.nextActions
      ]
    };
  }

  if (action.type === actions.START_GAME) {
    const playerOrder = state.playerOrder;
    const newUnits = {};
    const playerUnitId = uid();
    const deck = [];
    newUnits[playerUnitId] = {
      emoji: getStandardEmoji()[playerOrder.indexOf(action._sender)],
      health: 30,
      attack: 0,
      mana: 0
    };
    for (const card of getStandardDeck()) {
      const id = uid();
      newUnits[id] = { ...card };
      deck.push(id);
    }
    return {
      ...state,
      units: {
        ...state.units,
        ...newUnits
      },
      players: {
        ...state.players,
        [action._sender]: {
          ...INITIAL_PLAYER,
          unitId: playerUnitId,
          deck
        }
      },
      nextActions: [
        {
          playerId: action._sender,
          action: {
            type: actions.SHUFFLE_DECK,
            playerId: action._sender
          }
        },
        ...range(state.params.startDraw).map(() => ({
          playerId: action._sender,
          action: {
            type: actions.DRAW_CARD,
            target: {
              player: action._sender
            }
          }
        })),
        ...state.nextActions
      ]
    };
  }

  if (action.type === actions.START_TURN) {
    const player = state.players[state.turn];
    let newMana = player.mana + 1;

    if (newMana > 10) {
      newMana = 10;
    }
    const newUnits = {};
    player.field.forEach(unitId => {
      newUnits[unitId] = {
        ...state.units[unitId],
        canAttack: true
      };
    });
    return {
      ...state,
      units: {
        ...state.units,
        ...newUnits
      },
      players: {
        ...state.players,
        [state.turn]: {
          ...player,
          mana: newMana,
          availableMana: newMana
        }
      },
      nextActions: [
        {
          playerId: state.turn,
          action: { type: actions.DRAW_CARD, target: { player: state.turn } }
        },
        ...state.nextActions
      ]
    };
  }

  if (action.type === actions.END_TURN) {
    const playerIdx =
      (state.playerOrder.indexOf(state.turn) + 1) % state.playerOrder.length;
    const playerId = state.playerOrder[playerIdx];
    return {
      ...state,
      turn: playerId,
      nextActions: [
        {
          playerId,
          action: {
            type: actions.START_TURN
          }
        }
      ]
    };
  }

  if (action.type === actions.DRAW_CARD) {
    let players = state.playerOrder;
    if (action.target.player === "self") {
      players = [state.turn];
    } else if (action.target.player === "enemy") {
      players = state.playerOrder.filter(x => x !== state.turn);
    } else if (action.target.player) {
      players = [action.target.player];
    } else if (action.target.playerId) {
      players = [action.target.playerId];
    }
    for (const playerId of players) {
      const player = state.players[playerId];
      const unitId = player.deck[0];
      if (!unitId) {
        // fatigue
        state = {
          ...state,
          units: {
            ...state.units,
            [player.unitId]: {
              ...state.units[player.unitId],
              health: state.units[player.unitId].health - player.fatigue
            }
          },
          players: {
            ...state.players,
            [playerId]: {
              ...player,
              fatigue: player.fatigue + 1
            }
          }
        };
      } else {
        let newActions = [];
        if (unitId.secret && unitId.playerId !== playerId) {
          // card is encrypted by someone else, ask them to decrypt
          newActions.push({
            playerId: unitId.playerId,
            action: {
              type: actions.SHUFFLE_DECK_DECRYPT,
              playerId: playerId
            }
          });
        } else {
          throw new Error("who the butt encrypted this");
        }
        state = {
          ...state,
          players: {
            ...state.players,
            [playerId]: {
              ...player,
              hand: [unitId, ...player.hand],
              deck: player.deck.slice(1)
            }
          },
          nextActions: [...newActions, ...state.nextActions]
        };
      }
    }
    return state;
  }

  if (action.type === actions.PLAY_CREATURE) {
    const player = state.players[action._sender];
    const card = player.hand.filter(card => card.id === action.id)[0];
    const unitId = ssbKeys.unbox(card.box, { private: action.private });
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
        ...unit.onSummon.map((onSummon, i) => {
          return {
            playerId: action._sender,
            action: {
              ...onSummon,
              target: {
                ...onSummon.target,
                unitId: action.targets[i]
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
    const unitId = action.unitId;
    const card = state.units[unitId];
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
