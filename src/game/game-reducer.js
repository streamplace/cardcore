import * as actions from "./actions";

const INITIAL_STATE = {
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
      currentPlayer: action.currentPlayer,
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
    const player = state.players[action.playerId];
    const unitId = player.deck[0];
    if (!unitId) {
      // fatigue
      return {
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
          [action.playerId]: {
            ...player,
            fatigue: player.fatigue + 1
          }
        }
      };
    }

    return {
      ...state,
      players: {
        ...state.players,
        [action.playerId]: {
          ...player,
          hand: [...player.hand, unitId],
          deck: player.deck.slice(1)
        }
      }
    };
  }

  if (action.type === actions.PLAY_CREATURE) {
    console.log(action);
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
      }
    };
  }

  return state;
}
