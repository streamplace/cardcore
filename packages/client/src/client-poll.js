import { hashState, REMOTE_ACTION } from "@cardcore/util";
import { clientFetch } from "./client-fetch";

// this isn't a redux action really, don't tell anyone
export const clientGetGameHash = () => (dispatch, getState) => {
  const state = getState();
  return hashState(state.game);
};

const BACKOFF_INTERVALS = [50, 150, 500, 1000, 2000];

export const CLIENT_POLL = "CLIENT_POLL";
export const clientPoll = () => async (dispatch, getState) => {
  if (getState().client.polling) {
    throw new Error("tried to poll when already polling");
  }
  if (getState().client.loadingState) {
    throw new Error("tried to poll while loading state");
  }
  let backoffIdx = 0;
  await dispatch({
    type: CLIENT_POLL,
    polling: true,
  });
  const backoff = async () => {
    const backoffDuration = BACKOFF_INTERVALS[backoffIdx];
    if (BACKOFF_INTERVALS[backoffIdx + 1]) {
      backoffIdx += 1;
    }
    await new Promise((r) => setTimeout(r, backoffDuration));
    return poll();
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
      polling: false,
    });
    return dispatch({ ...action, [REMOTE_ACTION]: true });
  };
  return poll();
};
