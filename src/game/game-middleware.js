import signalhub from "signalhub";
import ssbKeys from "ssb-keys";
import stringify from "json-stable-stringify";
import sha256 from "./sha256";
import { desync, DESYNC } from "./actions";
import * as gameActions from "./actions";
import * as clientActions from "../client-actions";

export const REMOTE_ACTION = Symbol("REMOTE_ACTION");

export const gameMiddleware = store => {
  const server = `${document.location.protocol}//${document.location.host}`;
  const hub = signalhub("game", [server]);
  const getHash = () => {
    return new Promise((resolve, reject) => {
      resolve(sha256(stringify(store.getState().game)));
    });
  };
  hub.subscribe("default-game").on("data", async action => {
    const me = store.getState().client.keys;
    if (action._sender === me.id) {
      return;
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
      const me = store.getState().client.keys;
      const ret = await next({
        ...action,
        _me: me && me.id
      });
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
      running = false;
      const nextActions = store.getState().game.nextActions;
      if (nextActions.length > 0) {
        const { playerId, notPlayerId, action } = nextActions[
          nextActions.length - 1
        ];
        if (
          (playerId && playerId === me.id) ||
          (notPlayerId && notPlayerId !== me.id) // hack hack hack
        ) {
          await store.dispatch({
            ...action,
            _fromQueue: true
          });
        }
      }
      resolve(ret);
      runNext();
    };

    return action => {
      if (!action[REMOTE_ACTION]) {
        action = { ...action, _sender: store.getState().client.keys.id };
      }
      queue.push(action);
      const prom = new Promise((resolve, reject) => {
        promises.set(action, [resolve, reject]);
      });
      setTimeout(runNext, 0);
      return prom;
    };
  };
};
