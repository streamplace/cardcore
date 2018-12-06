import nlp from "compromise";

const simpleNumberLine = /^([a-zA-Z]+): (\d+)$/;
const singleWordLine = /^([a-zA-Z]+)$/;

const plugin = {
  words: {
    battlecry: "Trigger",
    set: "Action",
    "all other minions": "TargetCreatures",
    "all other creatures": "TargetCreatures",
    attack: "PropertyAttack",
    health: "PropertyHealth"
  },
  tags: {
    TargetCreatures: {
      isA: "Target"
    },
    PropertyAttack: {
      isA: "Property"
    },
    PropertyHealth: {
      isA: "Property"
    }
  },
  patterns: {
    "[#Trigger]: [.*]": "TriggerString"
  },
  plurals: {
    property: "properties"
  }
};

const BASIC_TRIGGER = "^#Trigger";

nlp.plugin(plugin);

export const setPhrase = doc => {
  if (!doc.has(BASIC_TRIGGER)) {
    return null;
  }
  // const match = doc.match(BASIC_TRIGGER);
  const restMatch = doc.not(BASIC_TRIGGER);

  if (
    !restMatch.has("^set #Target+ #Property+ and? #Property+? to #Cardinal")
  ) {
    return null;
  }

  const actionMatch = restMatch.match(
    "^set #Target+ #Property+ and? #Property+? to #Cardinal"
  );
  const cardinal = parseInt(
    actionMatch
      .match("#Cardinal+")
      .values()
      .toNumber()
      .out("normal")
  );

  const trigger = {
    action: "CARD_PLAYED",
    effects: []
  };

  const target = actionMatch.match("#Target+");
  if (target.has("#TargetCreatures")) {
    trigger.target = {
      type: "creature",
      location: "board"
    };
  } else {
    return null;
  }

  if (actionMatch.has("#PropertyHealth")) {
    trigger.effects.push({
      type: "SET_PROPERTY",
      property: "health",
      value: cardinal
    });
  }
  if (actionMatch.has("#PropertyAttack")) {
    trigger.effects.push({
      type: "SET_PROPERTY",
      property: "attack",
      value: cardinal
    });
  }
  if (trigger.effects.length === 0) {
    return null;
  }

  window.actionMatch = actionMatch;

  return {
    triggers: [trigger]
  };
};

export const parseCard = str => {
  const lines = str
    .trim()
    .split("\n")
    .filter(x => x);

  let ret = {};
  const errors = [];

  const name = lines.shift();
  ret.name = name;
  for (const line of lines) {
    // Simple number case, like "Health: 3"
    const simpleNumber = simpleNumberLine.exec(line);
    if (simpleNumber !== null) {
      const [key, value] = simpleNumber.slice(1);
      ret[key.toLowerCase()] = parseInt(value);
      continue;
    }

    const singleWord = singleWordLine.exec(line);
    // Single word case, like "Taunt"
    if (singleWord !== null) {
      ret[line.toLowerCase()] = true;
      continue;
    }

    // nlp.verbose("tagger");
    const doc = nlp(line);
    const result = setPhrase(doc);
    if (result) {
      ret = {
        ...ret,
        ...result
      };
      continue;
    }
    errors.push(`unhandled: ${line}`);
  }
  return {
    data: ret,
    errors
  };
};
