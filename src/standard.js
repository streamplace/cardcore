// emoji, attack, health, name, text, onSummon
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

export function battlecry(cost) {
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

const emojis = ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "☺️", "😊"];
