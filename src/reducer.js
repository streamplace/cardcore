import * as actions from "./actions";

const standard = cost => {
  const emoji = emojis[cost] || emojis[emojis.length - 1];
  return {
    cost: cost,
    emoji: emoji,
    attack: cost,
    health: cost,
    name: `Standard ${cost}-${cost}`
  };
};

const emojis = ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "☺️", "😊"];

const INITIAL_STATE = {
  playerOrder: ["me", "them"],
  currentPlayer: "me",
  turn: "me",
  players: {
    me: {
      mana: 1,
      availableMana: 1,
      health: 30,
      emoji: "🐙",
      hand: [standard(1), standard(2), standard(3)],
      deck: [standard(4), standard(5), standard(6)],
      field: []
    },
    them: {
      mana: 0,
      availableMana: 0,
      health: 30,
      emoji: "🐒",
      hand: [standard(2), standard(5), standard(7)],
      deck: [standard(4), standard(5), standard(6)],
      field: []
    }
  }
};

export default function reducer(state = INITIAL_STATE, action) {
  if (action.type === actions.END_TURN) {
    const playerIdx =
      (state.playerOrder.indexOf(state.turn) + 1) % state.playerOrder.length;
    const player = state.playerOrder[playerIdx];
    let newMana = state.players[player].mana + 1;
    if (newMana > 10) {
      newMana = 10;
    }
    return {
      ...state,
      turn: player,
      players: {
        ...state.players,
        [player]: {
          ...state.players[player],
          mana: newMana,
          availableMana: newMana
        }
      }
    };
  }

  if (action.type === actions.DRAW_CARD) {
    const player = state.players[action.playerId];
    const card = player.deck[0];
    if (!card) {
      return state;
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

  return state;
}
