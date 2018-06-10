import * as actions from "./actions";
import target from "./target-helper";

const INITIAL_STATE = {
  nextActions: [],
  params: {
    startDraw: 3
  },
  started: false,
  players: {},
  units: {}
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

export default function reducer(state = INITIAL_STATE, action) {
  // special logic to clean out the queue if we're executing a queued action
  if (action._fromQueue) {
    state = {
      ...state,
      nextActions: state.nextActions.slice(0, -1)
    };
  }
  if (action.type === actions.START_GAME) {
    const players = {};
    const newUnits = {};
    for (const [playerId, player] of Object.entries(action.players)) {
      const playerUnitId = uid();
      newUnits[playerUnitId] = {
        emoji: player.emoji,
        health: 30,
        attack: 0,
        mana: 0
      };
      players[playerId] = {
        ...INITIAL_PLAYER,
        unitId: playerUnitId,
        deck: []
      };
      for (const card of player.deck) {
        const id = uid();
        newUnits[id] = { ...card };
        players[playerId].deck.push(id);
      }
    }
    return {
      ...state,
      units: {
        ...state.units,
        ...newUnits
      },
      playerOrder: action.playerOrder,
      turn: action.playerOrder[0],
      players
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
      }
    };
  }

  if (action.type === actions.END_TURN) {
    const playerIdx =
      (state.playerOrder.indexOf(state.turn) + 1) % state.playerOrder.length;
    const playerId = state.playerOrder[playerIdx];
    return {
      ...state,
      turn: playerId
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
        state = {
          ...state,
          players: {
            ...state.players,
            [playerId]: {
              ...player,
              hand: [...player.hand, unitId],
              deck: player.deck.slice(1)
            }
          }
        };
      }
    }
    return state;
  }

  if (action.type === actions.PLAY_CREATURE) {
    const player = state.players[state.turn];
    const unitId = action.unitId;
    const card = state.units[unitId];
    return {
      ...state,
      players: {
        ...state.players,
        [state.turn]: {
          ...player,
          availableMana: player.availableMana - card.cost,
          hand: player.hand.filter(u => u !== unitId),
          field: [...player.field, unitId]
        }
      },
      units: {
        ...state.units,
        [unitId]: {
          ...card,
          canAttack: false
        }
      },
      nextActions: state.nextActions.concat([
        { playerId: state.turn, action: { type: actions.CHECK_DEATH } },
        ...card.onSummon.map((onSummon, i) => {
          return {
            playerId: state.turn,
            action: {
              ...onSummon,
              target: {
                ...onSummon.target,
                unitId: action.targets[i]
              },
              unitId: action.unitId
            }
          };
        })
      ])
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

  if (action.type === actions.BOUNCE) {
    const player = state.players[state.turn];
    const targets = target(state, action.target, unit => {
      return {
        ...unit
      };
    });

    const unitIds = Object.keys(targets);
    console.log("unit: " + unitIds);
    return {
      ...state,
      players: {
        ...state.players,
        [state.turn]: {
          ...player,
          hand: [...player.hand, unitIds],
          field: player.field.filter(
            unitId => state.units[unitId] !== state.units[unitIds]
          )
        }
      }
    };
  }

  return state;
}
