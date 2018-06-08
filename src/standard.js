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
    onSummon: [],
    onDeath: [],
    onEndOfTurn: [],
    onStartOfTurn: [],
    onSpellCast: [],
    onCreatureEntersField: []
  };
}

export const onDeathCreature = {
  ...standard(2),
  name: "Death Drawer",
  text: "onDeath: draw a card",
  onDeath: [
    {
      type: "DRAW_CARD",
      value: 1
    }
  ]
};

export const onSummonSummon = {
  ...standard(2),
  emoji: "",
  name: "Summon Dude",
  text: "onSummon: summon a 1/1 creature",
  onSummon: [
    {
      type: "SUMMON_CREATURE",
      value: 1
    }
  ]
};
export function threeMaster(cost) {
  const emoji = emojis[cost] || emojis[emojis.length - 1];
  return {
    cost: cost,
    // emoji: emoji,
    attack: cost,
    health: cost,
    type: "creature",
    name: "Three Master",
    text: `onSummon: Set all other creatures' Attack and Health to 3`,
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
    text: `onSummon: draw a card`,
    onSummon: [
      {
        type: "DRAW_CARD",
        value: 1,
        target: { type: "face" }
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
    text: `onSummon: deal 1 to three target creatures`,
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
