export * from "./target-helper";
export * from "./random-util";
export * from "./util";
export * from "./constants";
export { default as Box } from "./box";
export { default as hashState } from "./hash-state";
import fetch from "isomorphic-fetch";

export function serverFetch(url, ...args) {
  return fetch(`${url}`, ...args);
}
