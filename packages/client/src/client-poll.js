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
  const gameState = await res.json();
  dispatch({
    type: CLIENT_LOAD_STATE,
    gameState,
    [REMOTE_ACTION]: true,
    next: `${gameId}.sha256`
  });
};

export const clientPoll = () => async (dispatch, getState) => {
  const poll = async () => {
    const hash = await dispatch(clientGetGameHash());
    const res = await fetch(`/${hash}/next`);
    if (!res.ok || res.status === 204) {
      return;
    }
    const action = await res.json();
    dispatch({ ...action, [REMOTE_ACTION]: true });
  };
  poll();
  setInterval(poll, 2000);
};
