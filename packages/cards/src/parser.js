import nlp from "compromise";

const simpleNumberLine = /^([a-zA-Z]+): (\d+)$/;
const singleWordLine = /^([a-zA-Z]+)$/;

const plugin = {
  words: {
    battlecry: "Trigger",
    set: "Action",
    "all other minions": "Target"
  },
  patterns: {
    "#Trigger: won't let me (log|sign|get) in": "TriggerString"
  }
};
nlp.plugin(plugin);

export const parseCard = str => {
  const lines = str
    .trim()
    .split("\n")
    .filter(x => x);

  const ret = {};
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

    nlp.verbose("tagger");
    const doc = nlp(line);
    console.log(doc.clauses().data());

    errors.push(`unhandled: ${line}`);
  }
  return {
    data: ret,
    errors
  };
};
