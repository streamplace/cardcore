import { getServer, Storage } from "@cardcore/elements";
import fetch from "isomorphic-fetch";

class CachedResponse {
  constructor(str, status) {
    this.str = str;
    this.ok = true;
    this.status = status;
  }

  async text() {
    return this.str;
  }

  async json() {
    try {
      return JSON.parse(this.str);
    } catch (e) {
      console.error(this.str);
    }
  }
}

/**
 * Get the server... either it's been previously set or infer from environment
 */
export const clientGetServer = () => (dispatch, getState) => {
  const state = getState();
  if (state.client.server) {
    return state.client.server;
  }
  if (typeof getServer !== "undefined") {
    return getServer();
  }
  throw new Error(`Server wasn't set and we couldn't infer from environment`);
};

export const CLIENT_SET_SERVER = "CLIENT_SET_SERVER";
export const clientSetServer = ({ server }) => ({
  type: "CLIENT_SET_SERVER",
  server
});

export const clientServerReducer = (state, action) => {
  if (action.type === CLIENT_SET_SERVER) {
    return {
      ...state,
      client: {
        ...state.client,
        server: action.server
      }
    };
  }
  return state;
};

/**
 * fetch() wrapped suitable for use in a game. If the game gets closed, we'll disregard all pending
 * requests. Ideally we'd cancel the in-progress fetches as well but that's NYI in a lot of
 * environments.
 */
export const clientFetch = (url, opts = { method: "GET" }) => async (
  dispatch,
  getState
) => {
  if (opts.method === "GET" || opts.method === "HEAD") {
    try {
      const cached = await Storage.getItem(url);
      if (cached) {
        JSON.parse(cached);
        return new CachedResponse(cached, opts.method === "GET" ? 200 : 204);
      }
    } catch (e) {
      Storage.removeItem(url);
    }
  }
  const server = await dispatch(clientGetServer());
  return new Promise((resolve, reject) => {
    let res;
    fetch(`${server}${url}`, opts)
      .then(_res => {
        res = _res;
        return res.text();
      })
      .then(text => {
        if (getState().client.closed) {
          return;
        }
        resolve(new CachedResponse(text, res.status));
        if (!res.ok) {
          return;
        }
        if (opts.method === "GET") {
          if (res.status !== 200) {
            return;
          }
        } else {
          return;
        }
        setTimeout(async () => {
          Storage.setItem(url, text);
        }, 0);
      })
      .catch(err => {
        if (getState().client.closed) {
          return;
        }
        reject(err);
      });
  });
};
