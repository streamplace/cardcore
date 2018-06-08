// emoji, attack, health, name, text, onSummon
const emojis = ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "☺️", "😊"];
export function standard(cost) {
  const emoji = emojis[cost] || emojis[emojis.length - 1];
  return {
    cost: cost,
    emoji: emoji,
    attack: cost,
    health: cost,
    type: "creature",
    name: `Standard ${cost}-${cost}`,
    text: "",
    onSummon: []
  };
}

export function threeMaster(cost) {
  const emoji = emojis[cost] || emojis[emojis.length - 1];
  return {
    cost: cost,
    // emoji: emoji,
    attack: cost,
    health: cost,
    type: "creature",
    name: "Three Master",
    text: `On summon: Set all other creatures' Attack and Health to 3`,
    onSummon: [
      {
        type: "CHANGE_ALL_ATTACKS",
        value: 3,
        target: { type: "creature", location: "field" }
      },
      {
        type: "CHANGE_ALL_HEALTH",
        value: 3,
        target: { type: "creature", location: "field" }
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
    type: "creature",
    name: "Card Drawer",
    text: `On summon: draw a card`,
    onSummon: [
      {
        type: "DRAW_CARD",
        value: 1,
        target: { type: "player" }
      }
    ]
  };
}

export function damageCreature(cost) {
  const emoji = emojis[cost] || emojis[emojis.length - 1];
  return {
    cost: cost,
    // emoji: emoji,
    attack: cost,
    health: cost,
    type: "creature",
    name: "Creature Damager",
    text: `On summon: deal damage to target creature`,
    onSummon: [
      {
        type: "DAMAGE",
        value: 1,
        target: { type: "creature", count: 1, location: "field" }
      },
      {
        type: "DAMAGE",
        value: 1,
        target: { type: "creature", count: 1, location: "field" }
      },
      {
        type: "DAMAGE",
        value: 1,
        target: { type: "creature", count: 1, location: "field" }
      }
    ]
  };
}
