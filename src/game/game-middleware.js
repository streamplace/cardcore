import signalhub from "signalhub";
import ssbKeys from "ssb-keys";
import stringify from "json-stable-stringify";
import { sha256 } from "crypto-hash";
import { desync } from "./actions";

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
      running = true;
      const action = queue.shift();
      next(action);
      const hash = await getHash();
      if (action[REMOTE_ACTION]) {
        // we just completed a remote action, assert states match
        if (hash !== action._hash) {
          // very bad and extremely fatal for now - perhaps someday we recover
          sync = false;
          store.dispatch(me.id, store.getState());
        }
      } else {
        // tell everyone else the action happened and the resulting hash
        hub.broadcast("default-game", {
          ...action,
          _sender: me.id,
          _hash: hash
        });
      }
      running = false;
      runNext();
    };

    return async action => {
      queue.push(action);
      runNext();
    };
  };
};
