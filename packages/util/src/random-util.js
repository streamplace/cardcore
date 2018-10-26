// very simple PRNG from here https://gist.github.com/blixt/f17b47c62508be59987b

import ssbKeys from "@streamplace/ssb-keys";

export function shuffle(arr, func = Math.random) {
  // often times values from Object.keys and such can be nondeterministic, so
  arr = [...arr].sort();
  const randos = arr.map(() => func());
  return Object.keys(arr)
    .sort((a, b) => randos[a] - randos[b])
    .map(k => arr[k]);
}

export class RandomUtil {
  constructor(seed) {
    if (seed) {
      this.setSeed(seed);
    }
  }

  setSeed(seed) {
    // todo: broken and insecure
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
    if (!this.seed) {
      throw new Error("tried to use RNG without providing a seed!");
    }
    return (this.seed = (this.seed * 16807) % 2147483647);
  }

  nextFloat() {
    return (this.next() - 1) / 2147483646;
  }

  clearSeed() {
    this.seed = null;
  }
}

export const rando = new RandomUtil();
