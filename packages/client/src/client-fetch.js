import { getServer } from "@cardcore/elements";
import fetch from "isomorphic-fetch";

/**
 * fetch() wrapped suitable for use in a game. If the game gets closed, we'll disregard all pending
 * requests. Ideally we'd cancel the in-progress fetches as well but that's NYI in a lot of
 * environments.
 */
export const clientFetch = (url, ...args) => (dispatch, getState) => {
  return new Promise((resolve, reject) => {
    return fetch(`${getServer()}${url}`, ...args)
      .then(res => {
        if (getState().client.closed) {
          return;
        }
        resolve(res);
      })
      .catch(err => {
        if (getState().client.closed) {
          return;
        }
        reject(err);
      });
  });
};
