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
    text: [],
    onSummon: [],
  };
}

export const onSummonSummon = {
  ...standard(2),
  emoji: "",
  name: "Summon Dude",
  text: ["onSummon: summon a 1/1 creature"],
  onSummon: [
    {
      type: "SUMMON_CREATURE",
      unit: standard(1),
      target: { playerId: "SELF" },
    },
  ],
};

export const onSummonBounce = {
  ...standard(1),
  emoji: "",
  name: "Bouncer",
  text: ["onSummon: choose a friendly creature to return to your hand"],
  onSummon: [
    {
      type: "BOUNCE",
      target: { type: "creature", count: 1, location: "field", player: "self" },
    },
  ],
};
export function threeMaster(cost) {
  return {
    cost: cost,
    // emoji: emoji,
    attack: cost,
    health: cost,
    type: "creature",
    name: "Three Master",
    text: [`onSummon: Set all other creatures' Attack and Health to 3`],
    onSummon: [
      {
        type: "CHANGE_ATTACK",
        value: 3,
        target: { type: "creature", location: "field" },
      },
      {
        type: "CHANGE_HEALTH",
        value: 3,
        target: { type: "creature", location: "field" },
      },
    ],
  };
}

export function cardDraw(cost) {
  return {
    cost: cost,
    // emoji: emoji,
    attack: cost,
    health: cost,
    type: "creature",
    name: "Card Drawer",
    text: [`onSummon: draw a card`],
    onSummon: [
      {
        type: "DRAW_CARD",
        value: 1,
        target: { player: "self" },
      },
    ],
  };
}

export const onSummonDamageOwnHero = {
  ...standard(1),
  emoji: "",
  attack: 3,
  health: 2,
  name: "Owner Damager",
  text: [`onSummon: Deal 3 damage to your hero`],
  onSummon: [
    {
      type: "DAMAGE",
      value: 3,
      target: { type: "face", player: "self" },
    },
  ],
};

export function damageCreature(cost) {
  return {
    cost: cost,
    // emoji: emoji,
    attack: cost,
    health: cost,
    type: "creature",
    name: "Creature Damager",
    text: [`onSummon: deal 1 damage to three target creatures`],
    onSummon: [
      {
        type: "DAMAGE",
        value: 1,
        target: { type: "creature", count: 1, location: "field" },
      },
      {
        type: "DAMAGE",
        value: 1,
        target: { type: "creature", count: 1, location: "field" },
      },
      {
        type: "DAMAGE",
        value: 1,
        target: { type: "creature", count: 1, location: "field" },
      },
    ],
  };
}

export const onSummonRandomDamage = {
  ...standard(2),
  name: "Random Creature Damager",
  text: [`onSummon: deal 1 random damage to three target creatures`],
  onSummon: [
    {
      type: "DAMAGE",
      value: 1,
      target: { type: "creature", count: 1, location: "field", random: true },
    },
    {
      type: "DAMAGE",
      value: 1,
      target: { type: "creature", count: 1, location: "field", random: true },
    },
    {
      type: "DAMAGE",
      value: 1,
      target: { type: "creature", count: 1, location: "field", random: true },
    },
  ],
};

export function getStandardDeck() {
  return [
    standard(1),
    standard(2),
    standard(3),
    threeMaster(3),
    cardDraw(2),
    damageCreature(4),
    onSummonSummon,
    onSummonBounce,
    onSummonRandomDamage,
    onSummonDamageOwnHero,
  ];
}

export function getStandardEmoji() {
  return ["🐒", "🐙", "🐷", "😈", "👾", "🐝", "🌞"];
}
