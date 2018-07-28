// very simple PRNG from here https://gist.github.com/blixt/f17b47c62508be59987b

import ssbKeys from "ssb-keys";

export function shuffle(arr, func = Math.random) {
  const randos = arr.map(() => func());
  return Object.keys(arr)
    .sort((a, b) => randos[a] - randos[b])
    .map(k => arr[k]);
}

export class RandomUtil {
  constructor(seed) {
    if (!seed) {
      seed = ssbKeys.hash(`${Math.random()}`);
    }
    this.setSeed(seed);
  }

  setSeed(seed) {
    if (typeof seed === "string") {
      let seedInt = 0;
      for (let i = 0; i < seed.length; i += 1) {
        seedInt = (seedInt + seed.charCodeAt(i)) % 2147483647;
      }
      seed = seedInt;
    } else if (typeof seed !== "number") {
      throw new Error("seed must be a string or a number");
    }
    this.seed = seed % 2147483647;
    if (this.seed <= 0) this.seed += 2147483646;
  }

  shuffle(arr) {
    return shuffle(arr, this.next.bind(this));
  }

  next() {
    return (this.seed = (this.seed * 16807) % 2147483647);
  }

  nextFloat() {
    return (this.next() - 1) / 2147483646;
  }
}

export default new RandomUtil();
