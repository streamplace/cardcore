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
  players: ["me", "them"],
  sides: {
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
  return state;
}
