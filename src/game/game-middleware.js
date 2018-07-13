import signalhub from "signalhub";
import { desync, DESYNC } from "./actions";
import * as gameActions from "./actions";
import hashState from "./state-hasher";

export const REMOTE_ACTION = Symbol("REMOTE_ACTION");

export const gameMiddleware = store => {
  const server = `${document.location.protocol}//${document.location.host}`;
  const channelName = document.location.pathname.slice(1);
  const hub = signalhub("butt-card", [server]);
  hub.subscribe(channelName).on("data", async action => {
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
    let prevHash = null;

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
      const isGameAction = !!gameActions[action.type];
      const ret = await next({
        ...action,
        _me: me && me.id,
        _prev: isGameAction ? prevHash : undefined
      });
      const hash = await hashState(store.getState().game);
      if (action[REMOTE_ACTION]) {
        prevHash = hash;
        // we just completed a remote action, assert states match
        if (sync && hash !== action._hash) {
          // very bad and extremely fatal for now - perhaps someday we recover
          sync = false;
          store.dispatch(desync(me.id, store.getState().game));
        }
      } else if (gameActions[action.type]) {
        prevHash = hash;
        // tell everyone else the action happened and the resulting hash
        hub.broadcast(channelName, {
          ...action,
          _sender: me.id,
          _hash: hash
        });
      }
      const [resolve] = promises.get(action); // hack, maybe should reject?
      running = false;
      const nextActions = store.getState().game.nextActions;
      // only dequeue if a game action just happened - client actions don't count
      if (nextActions.length > 0 && gameActions[action.type]) {
        const { playerId, notPlayerId, action } = nextActions[0];
        if (!gameActions[action.type]) {
          throw new Error(
            `${action.type} is queued but we don't have a definition`
          );
        }
        if (
          (playerId && playerId === me.id) ||
          (notPlayerId && notPlayerId !== me.id) // hack hack hack
        ) {
          await store.dispatch({
            ...action,
            _fromQueue: true,
            _needsCreator: true,
            _sender: me.id
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
