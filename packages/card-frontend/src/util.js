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

export const traverseSecret = (secret, secrets) => {
  if (!secret || !secret.secret) {
    return secret;
  }
  if (secrets[secret.id]) {
    return traverseSecret(secrets[secret.id].contents, secrets);
  }
  return null;
};

/**
 * id-generation function that assumes that all users will execute it in the _exact_ same order.
 * this is.... hopefully reasonable.
 */
let cur = 0;
export const uid = () => {
  let res = `id-${cur}`;
  cur += 1;
  return res;
};
