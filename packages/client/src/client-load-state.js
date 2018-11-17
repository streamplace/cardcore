import { REMOTE_ACTION } from "@cardcore/util";
import { clientHandleNext } from "./client-next";
import { clientFetch } from "./client-fetch";
import { clientGetGameHash } from "./client-poll";

/**
 * Load the state of a game by replaying all the actions
 */
export const CLIENT_LOAD_STATE_START = "CLIENT_LOAD_STATE_START";
export const CLIENT_LOAD_STATE_DONE = "CLIENT_LOAD_STATE_DONE";
export const clientLoadState = gameId => async (dispatch, getState) => {
  const res = await dispatch(clientFetch(`/${gameId}`));
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
    next: gameId
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
  await dispatch(clientHandleNext());
};
