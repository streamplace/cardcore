// emoji, attack, health, name, text, onSummon
const emojis = ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "☺️", "😊"];
export function standard(cost) {
  const emoji = emojis[cost] || emojis[emojis.length - 1];
  return {
    cost: cost,
    emoji: emoji,
    attack: cost,
    health: cost,
    name: `Standard ${cost}-${cost}`,
    text: ""
  };
}

export function threeMaster(cost) {
  const emoji = emojis[cost] || emojis[emojis.length - 1];
  return {
    cost: cost,
    // emoji: emoji,
    attack: cost,
    health: cost,
    name: "Three Master",
    text: `On summon: Set all other creatures' Attack and Health to 3`,
    onSummon: [
      {
        type: "CHANGE_ALL_ATTACKS",
        value: 3
      },
      {
        type: "CHANGE_ALL_HEALTH",
        value: 3
      }
    ]
  };
}

export function cardDraw(cost) {
  const emoji = emojis[cost] || emojis[emojis.length - 1];
  return {
    cost: cost,
    // emoji: emoji,
    attack: cost,
    health: cost,
    name: "Card Drawer",
    text: `On summon: draw a card`,
    onSummon: [
      {
        type: "DRAW_CARD",
        value: 1
      }
    ]
  };
}
