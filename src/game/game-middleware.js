import signalhub from "signalhub";
import ssbKeys from "ssb-keys";
import stringify from "json-stable-stringify";
import { sha256 } from "crypto-hash";
import { desync, DESYNC } from "./actions";
import * as gameActions from "./actions";

export const REMOTE_ACTION = Symbol("REMOTE_ACTION");

const me = ssbKeys.generate();

export const gameMiddleware = store => {
  const server = `${document.location.protocol}//${document.location.host}`;
  const hub = signalhub("game", [server]);
  const getHash = async () => {
    return await sha256(stringify(store.getState().game));
  };
  hub.subscribe("default-game").on("data", async action => {
    if (action._sender === me.id) {
      return;
    }
    // temporary hack to put two players on opposite sides
    if (action.type === "START_GAME") {
      action.currentPlayer = action.playerOrder.filter(
        x => x !== action.currentPlayer
      )[0];
    }
    action = {
      ...action,
      [REMOTE_ACTION]: true
    };
    store.dispatch(action);
  });

  const promises = new WeakMap();

  return next => {
    const queue = [];
    let running = false;
    let sync = true;

    const runNext = async () => {
      if (running) {
        return;
      }
      if (queue.length === 0) {
        return;
      }
      const action = queue.shift();
      if (!sync && action.type !== DESYNC) {
        // if we lost sync, the only thing we accept is desync reports
        running = false;
        return;
      }
      running = true;
      const ret = next(action);
      const hash = await getHash();
      if (action[REMOTE_ACTION]) {
        // we just completed a remote action, assert states match
        if (sync && hash !== action._hash) {
          // very bad and extremely fatal for now - perhaps someday we recover
          sync = false;
          store.dispatch(desync(me.id, store.getState().game));
        }
      } else if (gameActions[action.type]) {
        // tell everyone else the action happened and the resulting hash
        hub.broadcast("default-game", {
          ...action,
          _sender: me.id,
          _hash: hash
        });
      }
      const [resolve, reject] = promises.get(action);
      resolve(ret);
      running = false;
      runNext();
    };

    return action => {
      queue.push(action);
      const prom = new Promise((resolve, reject) => {
        promises.set(action, [resolve, reject]);
      });
      setTimeout(runNext, 0);
      return prom;
    };
  };
};
