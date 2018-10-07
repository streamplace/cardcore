import { hashState } from "@cardcore/util";
import { serverFetch } from "@cardcore/elements";
import { REMOTE_ACTION } from "cardcore";

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
  const res = await serverFetch(`/${gameId}.sha256`);
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
    const headRes = await serverFetch(`/${hash}/next`, {
      method: "HEAD"
    });
    if (headRes.status !== 204) {
      break;
    }
    const actionRes = await serverFetch(`/${hash}/next`);
    const action = await actionRes.json();
    await dispatch({ ...action, [REMOTE_ACTION]: true });
  }
  await dispatch({
    type: "CLIENT_LOAD_STATE_DONE"
  });
};

const BACKOFF_INTERVALS = [50, 150, 500, 1000, 2000];

export const CLIENT_POLL = "CLIENT_POLL";
export const clientPoll = () => async (dispatch, getState) => {
  const { client } = getState();
  if (client.loadingState || client.polling || client.closed) {
    return;
  }
  let handle;
  let backoffIdx = 0;
  await dispatch({ type: "CLIENT_POLL", polling: true });
  const backoff = () => {
    handle = setTimeout(poll, BACKOFF_INTERVALS[backoffIdx]);
    if (BACKOFF_INTERVALS[backoffIdx + 1]) {
      backoffIdx += 1;
    }
    return;
  };
  const poll = async () => {
    const hash = await dispatch(clientGetGameHash());
    const res = await serverFetch(`/${hash}/next`);
    if (getState().client.closed) {
      return;
    }
    if (!res.ok || res.status === 204) {
      return backoff();
    }
    const action = await res.json();
    const me = getState().client.keys;
    if (action._sender === me.id) {
      return backoff();
    }
    dispatch({ ...action, [REMOTE_ACTION]: true });
    await dispatch({ type: "CLIENT_POLL", polling: false });
  };
  poll();
};
