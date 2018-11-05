import { hashState, REMOTE_ACTION } from "@cardcore/util";
import { clientFetch } from "./client-fetch";
import { clientNext } from "./client-next";

// this isn't a redux action really, don't tell anyone
export const clientGetGameHash = () => (dispatch, getState) => {
  const state = getState();
  return hashState(state.game);
};

/**
 * Load the state of a game by replaying all the actions
 */
export const CLIENT_LOAD_STATE_START = "CLIENT_LOAD_STATE_START";
export const CLIENT_LOAD_STATE_DONE = "CLIENT_LOAD_STATE_DONE";
export const clientLoadState = gameId => async (dispatch, getState) => {
  const res = await dispatch(clientFetch(`/${gameId}.sha256`));
  if (res.status !== 200) {
    const err = await res.text();
    console.error(err);
    return;
  }
  const startState = await res.json();
  await dispatch({
    type: CLIENT_LOAD_STATE_START,
    gameState: startState,
    [REMOTE_ACTION]: true,
    next: `${gameId}.sha256`
  });
  while (true) {
    const hash = await dispatch(clientGetGameHash());
    const headRes = await dispatch(
      clientFetch(`/${hash}/next`, {
        method: "HEAD"
      })
    );
    if (headRes.status !== 204) {
      break;
    }
    const actionRes = await dispatch(clientFetch(`/${hash}/next`));
    const action = await actionRes.json();
    // we don't want REMOTE_ACTION to muck up our verification, so...
    const newAct = { ...action };
    Object.defineProperty(newAct, REMOTE_ACTION, {
      value: true,
      enumerable: false
    });
    await dispatch(newAct);
    await new Promise(r => setTimeout(r, 0));
  }
  await dispatch({
    type: "CLIENT_LOAD_STATE_DONE"
  });
  await dispatch(clientNext());
};

const BACKOFF_INTERVALS = [50, 150, 500, 1000, 2000];

export const CLIENT_POLL = "CLIENT_POLL";
export const clientPoll = () => async (dispatch, getState) => {
  if (getState().client.polling) {
    return;
  }
  if (getState().client.loadingState) {
    return;
  }
  let backoffIdx = 0;
  await dispatch({
    type: CLIENT_POLL,
    polling: true
  });
  const backoff = () => {
    setTimeout(poll, BACKOFF_INTERVALS[backoffIdx]);
    if (BACKOFF_INTERVALS[backoffIdx + 1]) {
      backoffIdx += 1;
    }
    return;
  };
  const poll = async () => {
    if (getState().client.closed) {
      return;
    }
    const hash = await dispatch(clientGetGameHash());
    const res = await dispatch(clientFetch(`/${hash}/next`));
    if (!res.ok || res.status === 204) {
      return backoff();
    }
    const action = await res.json();
    const me = getState().client.keys;
    if (action.agent === me.id) {
      return backoff();
    }
    await dispatch({
      type: CLIENT_POLL,
      polling: false
    });
    dispatch({ ...action, [REMOTE_ACTION]: true });
  };
  poll();
};
