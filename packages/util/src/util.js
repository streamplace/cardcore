import { rando } from "./random-util";
import ssbKeys from "@streamplace/ssb-keys";

/**
 * Like Python's range. Get an array of numbers from 0 to n.
 */
export function range(size, startAt = 0) {
  return [...Array(size).keys()].map(i => i + startAt);
}

/**
 * Return an array rotated so elem is first. Useful for encrypt-decrypt order and such.
 */
export const rotateArray = (arr, startElem) => {
  const output = [];
  let idx = arr.indexOf(startElem);
  if (idx === -1) {
    throw new Error(`${startElem} is not in ${JSON.stringify(arr)}`);
  }
  while (output.length < arr.length) {
    output.push(arr[idx]);
    idx += 1;
    if (idx >= arr.length) {
      idx = 0;
    }
  }
  return output;
};

/**
 * Get the player to the left of this one
 */
export const getLeftPlayer = (playerId, players) => {
  const index = players.indexOf(playerId);
  if (index === 0) {
    return players[players.length - 1];
  }
  return players[index - 1];
};

/**
 * Get the player to the right of this one
 */
export const getRightPlayer = (playerId, players) => {
  const index = players.indexOf(playerId);
  if (index === players.length - 1) {
    return players[0];
  }
  return players[index + 1];
};

export const traverseSecret = (secret, secrets) => {
  if (!secret || !secret.secret) {
    return secret;
  }
  if (secrets[secret.id]) {
    return traverseSecret(secrets[secret.id].contents, secrets);
  }
  return null;
};

export const uid = () => {
  return `id-${rando.next()}`;
};
