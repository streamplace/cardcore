// import signalhub from "signalhub";
import * as gameActions from "@cardcore/game";
import { CLIENT_LOAD_STATE_DONE, clientPoll } from "@cardcore/client";
import { hashState, serverFetch } from "@cardcore/util";
import ssbKeys from "@streamplace/ssb-keys";
import stringify from "json-stable-stringify";

// this used to be a Symbol, but not supported on android?! weird.
export const REMOTE_ACTION = "__REMOTE_ACTION";

export function gameMiddleware(store) {
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
        store.dispatch(clientPoll());
        return;
      }
      const action = queue.shift();
      if (!sync && action.type !== gameActions.DESYNC) {
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
        prev: isGameAction ? prevHash : undefined
      });
      const hash = await hashState(store.getState().game);
      if (action[REMOTE_ACTION]) {
        prevHash = hash;
        // we just completed a remote action, assert states match
        if (sync && hash !== action.next) {
          // very bad and extremely fatal for now - perhaps someday we recover
          sync = false;
          store.dispatch(gameActions.desync(me.id, store.getState().game));
        }
      } else if (
        gameActions[action.type] &&
        action.type !== gameActions.DESYNC
      ) {
        const prev = prevHash;
        prevHash = hash;
        // tell everyone else the action happened and the resulting hash
        const next = hash;
        const signedAction = ssbKeys.signObj(me, {
          ...action,
          prev,
          next
        });
        const res = await serverFetch(`/${encodeURIComponent(next)}`, {
          method: "POST",
          body: stringify(signedAction),
          headers: {
            "content-type": "application/json"
          }
        });
        if (res.status === 409) {
          sync = false;
          store.dispatch(gameActions.desync("client", store.getState().game));
          const server = await res.json();
          store.dispatch(gameActions.desync("server", server.state.game));
        }
      }
      const [resolve] = promises.get(action); // hack, maybe should reject?
      running = false;
      const state = store.getState();
      const nextActions = state.game && state.game.nextActions;
      // only dequeue if a game action just happened - client actions don't count
      if (
        nextActions &&
        nextActions.length > 0 &&
        (gameActions[action.type] || action.type === CLIENT_LOAD_STATE_DONE) &&
        !state.client.loadingState
      ) {
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
}
