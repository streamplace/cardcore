import * as actions from "./actions";

const INITIAL_STATE = {
  params: {
    startDraw: 3
  },
  started: false,
  players: {}
};

const INITIAL_PLAYER = {
  mana: 0,
  availableMana: 0,
  health: 30,
  hand: [],
  deck: [],
  field: [],
  fatigue: 1
};

export default function reducer(state = INITIAL_STATE, action) {
  if (action.type === actions.START_GAME) {
    const players = {};
    for (const [playerId, player] of Object.entries(action.players)) {
      players[playerId] = {
        ...INITIAL_PLAYER,
        ...player
      };
    }
    return {
      ...state,
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
    return {
      ...state,
      players: {
        ...state.players,
        [state.turn]: {
          ...player,
          mana: newMana,
          availableMana: newMana,
          field: player.field.map(card => ({ ...card, canAttack: true }))
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
    const card = player.deck[0];
    if (!card) {
      return {
        ...state,
        players: {
          ...state.players,
          [action.playerId]: {
            ...player,
            fatigue: player.fatigue + 1,
            health: player.health - player.fatigue
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
          hand: [...player.hand, { ...card }],
          deck: player.deck.slice(1)
        }
      }
    };
  }

  if (action.type === actions.PLAY_CREATURE) {
    const player = state.players[state.turn];
    const card = action.card;
    return {
      ...state,
      players: {
        ...state.players,
        [state.turn]: {
          ...player,
          availableMana: player.availableMana - card.cost,
          hand: player.hand.filter(c => c !== card),
          field: [
            ...player.field,
            {
              ...card,
              canAttack: false
            }
          ]
        }
      }
    };
  }

  return state;
}
