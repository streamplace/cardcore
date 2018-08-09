import { hashState } from "@cardcore/util";
import { REMOTE_ACTION } from "cardcore";

// this isn't a redux action really, don't tell anyone
export const clientGetGameHash = () => (dispatch, getState) => {
  const state = getState();
  return hashState(state.game);
};

export const CLIENT_LOAD_STATE = "CLIENT_LOAD_STATE";
export const clientLoadState = gameId => async (dispatch, getState) => {
  const res = await fetch(`/${gameId}.sha256`);
  if (res.status !== 200) {
    const err = await res.text();
    console.error(err);
    return;
  }
  const gameState = await res.json();
  dispatch({
    type: CLIENT_LOAD_STATE,
    gameState,
    [REMOTE_ACTION]: true,
    next: `${gameId}.sha256`
  });
};

let polling = false;

const BACKOFF_INTERVALS = [50, 150, 500, 1000, 2000];

export const clientPoll = () => async (dispatch, getState) => {
  if (polling) {
    return;
  }
  let handle;
  let backoffIdx = 0;
  polling = true;
  const backoff = () => {
    handle = setTimeout(poll, BACKOFF_INTERVALS[backoffIdx]);
    if (BACKOFF_INTERVALS[backoffIdx + 1]) {
      backoffIdx += 1;
    }
    return;
  };
  const poll = async () => {
    const hash = await dispatch(clientGetGameHash());
    const res = await fetch(`/${hash}/next`);
    if (!res.ok || res.status === 204) {
      return backoff();
    }
    const action = await res.json();
    const me = getState().client.keys;
    if (action._sender === me.id) {
      return backoff();
    }
    polling = false;
    dispatch({ ...action, [REMOTE_ACTION]: true });
  };
  poll();
};
